import { encrypt, decrypt } from '@/lib/crypto';
import { supabase } from '@/lib/supabase';

interface InstagramComment {
  id: string;
  text?: string;
  created_time?: number;
  media?: {
    id: string;
  };
  from?: {
    id: string;
    username: string;
  };
}

interface InstagramAutomation {
  id: string;
  account_id: string;
  name: string;
  public_reply_variants?: string[];
  opening_dm?: string;
  requires_follow?: boolean;
  follow_prompt_message?: string | null;
  follow_up_message?: string | null;
  follow_up_delay_minutes?: number | null;
  final_message?: string | null;
  final_links?: string[] | null;
  email_capture?: boolean;
  is_active?: boolean;
}

interface ConversationStateWithAutomation {
  id: string;
  contact_id: string;
  automation_id: string;
  current_step: string;
  window_expires_at: string;
  automations: InstagramAutomation | null;
}

/**
 * Executes a Meta Graph API call with exponential backoff on HTTP 429 (Rate Limit) errors.
 */
async function fetchWithBackoff(
  url: string,
  options: RequestInit,
  retries = 3,
  delay = 1000
): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (res.status === 429 && retries > 0) {
      console.warn(`[Meta API] Rate limited (429). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithBackoff(url, options, retries - 1, delay * 2);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      console.warn(`[Meta API] Fetch failed. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithBackoff(url, options, retries - 1, delay * 2);
    }
    throw err;
  }
}

/**
 * Core Instagram comment webhook trigger logic.
 */
export async function handleCommentTrigger(
  comment: InstagramComment,
  automation: InstagramAutomation
) {
  try {
    console.log(`[Instagram Trigger] Processing comment trigger ${comment.id}`);

    // 1. Fetch and decrypt the account's access token
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, encrypted_access_token, ig_user_id')
      .eq('id', automation.account_id)
      .single();

    if (accountError || !account) {
      throw new Error(`Account not found or access denied: ${automation.account_id}`);
    }

    const accessToken = decrypt(account.encrypted_access_token);

    // 1b. Verify comment is within 7 days (limit set by Meta)
    if (comment.created_time) {
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (nowInSeconds - comment.created_time > sevenDaysInSeconds) {
        console.warn(`[Instagram Trigger] Comment ${comment.id} is older than 7 days. Skipping private reply.`);
        return;
      }
    }

    // 2. Post a random public reply variant (if any are configured)
    const replies = automation.public_reply_variants || [];
    if (replies.length > 0) {
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      console.log(`[Meta API] Posting public reply variant: "${randomReply}" to comment ${comment.id}`);
      
      const replyRes = await fetchWithBackoff(
        `https://graph.instagram.com/v21.0/${comment.id}/replies`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: randomReply,
            access_token: accessToken,
          }),
        }
      );
      
      const replyData = await replyRes.json();
      if (replyData.error) {
        console.error(`[Meta API Error] Failed to post public reply:`, replyData.error.message);
      } else {
        console.log(`[Meta API] Public reply posted successfully for comment ${comment.id}`);
      }
    }

    // 3. Upsert contact record for the commenter
    if (!comment.from || !comment.from.id) {
      throw new Error('Comment payload missing sender details (from.id).');
    }

    let contactId = '';
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('account_id', account.id)
      .eq('igsid', comment.from.id)
      .maybeSingle();

    if (existingContact) {
      contactId = existingContact.id;
      await supabase
        .from('contacts')
        .update({
          last_interaction_at: new Date().toISOString(),
          username: comment.from.username,
        })
        .eq('id', contactId);
    } else {
      const { data: newContact, error: insertError } = await supabase
        .from('contacts')
        .insert({
          account_id: account.id,
          igsid: comment.from.id,
          username: comment.from.username,
          last_interaction_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError || !newContact) {
        throw new Error(`Failed to create contact record in DB: ${insertError?.message}`);
      }
      contactId = newContact.id;
    }

    // Log the incoming comment
    await supabase.from('message_log').insert({
      contact_id: contactId,
      automation_id: automation.id,
      direction: 'in',
      content: comment.text || '',
      status: 'comment_received',
    });

    // 4. Verify account's hourly send count to respect Meta rate limits
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from('message_log')
      .select('id, contacts!inner(account_id)', { count: 'exact', head: true })
      .eq('direction', 'out')
      .eq('contacts.account_id', account.id)
      .gt('created_at', oneHourAgo);

    if (countError) {
      console.error('[Supabase Error] Failed to fetch message log count:', countError);
    }

    const currentHourSends = count || 0;
    const isRateLimitExceeded = currentHourSends >= 200;

    // 5. Send or queue private DM reply
    const openingDm = automation.opening_dm || '';
    if (openingDm) {
      if (!isRateLimitExceeded) {
        // Send DM immediately
        console.log(`[Meta API] Sending private reply for comment ${comment.id}`);
        const dmRes = await fetchWithBackoff(
          `https://graph.instagram.com/v21.0/${account.ig_user_id}/messages`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient: { comment_id: comment.id },
              message: { text: openingDm },
              access_token: accessToken,
            }),
          }
        );
        
        const dmData = await dmRes.json();
        if (dmData.error) {
          console.error(`[Meta API Error] Failed to send private DM:`, dmData.error.message);
          
          // Log failed outbox message
          await supabase.from('message_log').insert({
            contact_id: contactId,
            automation_id: automation.id,
            direction: 'out',
            content: openingDm,
            status: `failed: ${dmData.error.message}`,
          });
        } else {
          console.log(`[Meta API] Private DM sent successfully for comment ${comment.id}`);
          
          // Log successful outbox message
          await supabase.from('message_log').insert({
            contact_id: contactId,
            automation_id: automation.id,
            direction: 'out',
            content: openingDm,
            status: 'sent',
          });
        }
      } else {
        // Queue the reply to be sent later
        console.log(`[Send Queue] Rate limit of 200 reached. Queueing message for comment ${comment.id}`);
        await supabase.from('send_queue').insert({
          account_id: account.id,
          contact_id: contactId,
          payload: {
            comment_id: comment.id,
            message: openingDm,
            comment_created_time: comment.created_time,
          },
          scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Schedule 5 minutes out
          sent: false,
          attempts: 0,
        });
      }
    }

    // 6. Upsert conversation state
    const { data: existingState } = await supabase
      .from('conversation_state')
      .select('id')
      .eq('contact_id', contactId)
      .eq('automation_id', automation.id)
      .maybeSingle();

    const stateData = {
      contact_id: contactId,
      automation_id: automation.id,
      current_step: 'awaiting_followup',
      window_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
    };

    if (existingState) {
      await supabase
        .from('conversation_state')
        .update(stateData)
        .eq('id', existingState.id);
    } else {
      await supabase
        .from('conversation_state')
        .insert(stateData);
    }
    
    console.log(`[Instagram Trigger] Successfully completed trigger sequence for comment ${comment.id}`);
  } catch (err) {
    // Log error, but do not throw to caller to keep the webhook running
    console.error(`[Instagram Trigger Error] Failed to process comment trigger for comment ${comment.id}:`, err);
  }
}

/**
 * Processes incoming message events when a contact replies in DM.
 */
export async function handleMessageEvent(
  senderId: string,     // The contact's IGSID
  recipientId: string,  // The business profile's Instagram User ID
  text: string          // Message text content
) {
  try {
    console.log(`[Instagram Webhook DM] Received message from ${senderId} to ${recipientId}: "${text}"`);

    // 1. Resolve connected account (single-tenant routing)
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, encrypted_access_token')
      .limit(1)
      .maybeSingle();

    if (accountError || !account) {
      console.warn(`[Instagram Webhook DM] Account not found in database: ${accountError?.message || 'Empty accounts table'}`);
      return;
    }

    // 2. Find contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('account_id', account.id)
      .eq('igsid', senderId)
      .maybeSingle();

    if (contactError || !contact) {
      console.log(`[Instagram Webhook DM] No contact record found for sender: ${senderId}`);
      return;
    }

    // Update last interaction time
    await supabase
      .from('contacts')
      .update({ last_interaction_at: new Date().toISOString() })
      .eq('id', contact.id);

    // 3. Find active conversation state
    const { data: stateData, error: stateError } = await supabase
      .from('conversation_state')
      .select('*, automations(*)')
      .eq('contact_id', contact.id)
      .gt('window_expires_at', new Date().toISOString())
      .maybeSingle();

    if (stateError || !stateData) {
      console.log(`[Instagram Webhook DM] No active or non-expired conversation state for contact: ${contact.id}`);
      return;
    }

    const state = stateData as unknown as ConversationStateWithAutomation;
    const automation = state.automations;
    if (!automation) {
      console.log(`[Instagram Webhook DM] Conversation state is missing automation metadata: ${state.id}`);
      return;
    }

    const accessToken = decrypt(account.encrypted_access_token);

    // Log the incoming DM message
    await supabase.from('message_log').insert({
      contact_id: contact.id,
      automation_id: automation.id,
      direction: 'in',
      content: text,
      status: 'dm_received',
    });

    // Helper to send message and log it
    const sendDmAndLog = async (msgText: string) => {
      const dmRes = await fetchWithBackoff(
        `https://graph.instagram.com/v21.0/me/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: senderId },
            message: { text: msgText },
            access_token: accessToken,
          }),
        }
      );
      
      const dmData = await dmRes.json();
      if (dmData.error) {
        console.error(`[Meta API Error] Failed to send DM reply:`, dmData.error.message);
        await supabase.from('message_log').insert({
          contact_id: contact.id,
          automation_id: automation.id,
          direction: 'out',
          content: msgText,
          status: `failed: ${dmData.error.message}`,
        });
      } else {
        await supabase.from('message_log').insert({
          contact_id: contact.id,
          automation_id: automation.id,
          direction: 'out',
          content: msgText,
          status: 'sent',
        });
      }
    };

    // Helper to send final step (final message + links)
    const sendFinalStep = async () => {
      const finalMsg = automation.final_message || '';
      const links = automation.final_links || [];
      
      let fullMessage = finalMsg;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      if (links.length > 0) {
        const trackingLinks: string[] = [];
        for (const link of links) {
          // Insert into tracked_links
          const { data: trackData, error: trackError } = await supabase
            .from('tracked_links')
            .insert({
              automation_id: automation.id,
              original_url: link,
            })
            .select('id')
            .single();

          if (trackError || !trackData) {
            console.error('[Redirect Link] Failed to create tracked link:', trackError);
            trackingLinks.push(link);
          } else {
            trackingLinks.push(`${siteUrl}/r/${trackData.id}`);
          }
        }
        fullMessage += '\n\n' + trackingLinks.join('\n');
      }

      if (fullMessage) {
        await sendDmAndLog(fullMessage);
      }
      
      // Update state to completed
      await supabase
        .from('conversation_state')
        .update({ current_step: 'completed' })
        .eq('id', state.id);
    };

    // Helper to check follow status
    const checkFollowStatus = async (): Promise<boolean> => {
      try {
        console.log(`[Meta API] Checking follow status for IGSID: ${senderId}`);
        const profileRes = await fetchWithBackoff(
          `https://graph.instagram.com/v21.0/${senderId}?fields=follows_business&access_token=${accessToken}`,
          { method: 'GET' }
        );
        const profileData = await profileRes.json();
        
        if (profileData.error) {
          console.error(`[Meta API Error] Follow status check returned error:`, profileData.error.message);
          
          await supabase.from('message_log').insert({
            contact_id: contact.id,
            automation_id: automation.id,
            direction: 'out',
            content: `Follow check passed (failed open on error: ${profileData.error.message})`,
            status: 'follow_passed',
          });

          return true; // Fail open
        }

        // CRITICAL COMMENT: The 'follows_business' field is not officially guaranteed by Meta
        // and may be inconsistent or unavailable. Log a warning rather than failing silently when missing.
        if (profileData.follows_business === undefined) {
          console.warn(
            `[Meta API Warning] 'follows_business' field is missing or unavailable. Meta may have deprecated it or client permissions are insufficient. Defaulting to 'true' (fail open).`
          );
          
          await supabase.from('message_log').insert({
            contact_id: contact.id,
            automation_id: automation.id,
            direction: 'out',
            content: 'Follow check passed (failed open due to missing field)',
            status: 'follow_passed',
          });

          return true; // Fail open
        }

        const isFollowing = !!profileData.follows_business;

        await supabase.from('message_log').insert({
          contact_id: contact.id,
          automation_id: automation.id,
          direction: 'out',
          content: isFollowing ? 'Follow check passed' : 'Follow check failed',
          status: isFollowing ? 'follow_passed' : 'follow_failed',
        });

        return isFollowing;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[Meta API Error] Failed to fetch user profile:`, err);
        
        await supabase.from('message_log').insert({
          contact_id: contact.id,
          automation_id: automation.id,
          direction: 'out',
          content: `Follow check passed (failed open on exception: ${errorMsg})`,
          status: 'follow_passed',
        });

        return true; // Fail open
      }
    };

    // 4. State Machine transitions
    let currentStep = state.current_step;

    if (currentStep === 'awaiting_followup') {
      const followUpMsg = automation.follow_up_message;
      if (followUpMsg) {
        console.log(`[State Machine] Sending follow-up message`);
        await sendDmAndLog(followUpMsg);
      }
      
      // Transition to awaiting_follow_check
      await supabase
        .from('conversation_state')
        .update({ current_step: 'awaiting_follow_check' })
        .eq('id', state.id);
      
      // Move variable state forward to immediately process check
      currentStep = 'awaiting_follow_check';
    }

    if (currentStep === 'awaiting_follow_check') {
      const requiresFollow = automation.requires_follow ?? false;
      let isFollowing = true;

      if (requiresFollow) {
        isFollowing = await checkFollowStatus();
      }

      if (isFollowing) {
        console.log(`[State Machine] Follow condition met (or skipped)`);
        
        // Check email capture status
        const needsEmail = automation.email_capture && !contact.email;
        if (needsEmail) {
          console.log(`[State Machine] Prompting for email capture`);
          await sendDmAndLog('Please reply with your email address to receive the details.');
          await supabase
            .from('conversation_state')
            .update({ current_step: 'awaiting_email' })
            .eq('id', state.id);
        } else {
          console.log(`[State Machine] Executing final step`);
          await sendFinalStep();
        }
      } else {
        console.log(`[State Machine] Follow condition failed. Prompting user.`);
        const followPrompt = automation.follow_prompt_message || 'Please follow our profile first to get the link!';
        await sendDmAndLog(followPrompt);
        // Stay on awaiting_follow_check step
      }
    } else if (currentStep === 'awaiting_email') {
      // Check if message text matches a basic email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedText = text.trim();

      if (emailRegex.test(trimmedText)) {
        console.log(`[State Machine] Valid email captured: ${trimmedText}`);
        
        // Save email to contact
        await supabase
          .from('contacts')
          .update({ email: trimmedText })
          .eq('id', contact.id);

        console.log(`[State Machine] Email saved. Executing final step.`);
        await sendFinalStep();
      } else {
        console.log(`[State Machine] Invalid email captured: "${trimmedText}". Re-prompting.`);
        await sendDmAndLog("That doesn't look like a valid email address. Please reply with a valid email to get your link.");
        // Stay on awaiting_email step
      }
    }
  } catch (err) {
    console.error(`[Instagram DM Error] Failed to process message event from ${senderId}:`, err);
  }
}

export async function initializeAccountIfNeeded(): Promise<{ success: boolean; error?: string }> {
  try {
    const { count, error: countError } = await supabase
      .from('accounts')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      return { success: false, error: `Database check failed: ${countError.message}` };
    }

    if (count && count > 0) {
      return { success: true };
    }

    // No account row exists, let's auto-connect using env variables
    const token = process.env.META_INITIAL_ACCESS_TOKEN;
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!token || !appId || !appSecret) {
      return {
        success: false,
        error: 'Missing required environment variables: META_INITIAL_ACCESS_TOKEN, META_APP_ID, or META_APP_SECRET.',
      };
    }

    // Call GET https://graph.instagram.com/v21.0/me?fields=id,username&access_token=...
    console.log('[Auto-Init] Verifying Instagram access token with graph.instagram.com/v21.0/me...');
    const meRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=id,username&access_token=${token}`
    );
    const meData = await meRes.json();

    if (meData.error) {
      return {
        success: false,
        error: `Instagram API Error: ${meData.error.message}`,
      };
    }

    const igUserId = meData.id;
    const igUsername = meData.username;

    if (!igUserId || !igUsername) {
      return {
        success: false,
        error: 'Instagram verification response was missing user id or username.',
      };
    }

    // Encrypt credentials
    const encryptedToken = encrypt(token);
    const encryptedSecret = encrypt(appSecret);

    // Save account row to database
    const { error: insertError } = await supabase.from('accounts').insert({
      ig_user_id: igUserId,
      ig_username: igUsername,
      encrypted_access_token: encryptedToken,
      app_id: appId,
      encrypted_app_secret: encryptedSecret,
    });

    if (insertError) {
      return {
        success: false,
        error: `Failed to insert account into database: ${insertError.message}`,
      };
    }

    console.log(`[Auto-Init] Successfully connected Instagram account: @${igUsername}`);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Auto-Init Exception] Failed to initialize Instagram account:', err);
    return { success: false, error: `Initialization Exception: ${msg}` };
  }
}

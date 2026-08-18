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
  message?: string | null;
  links?: string[] | null;
  requires_follow?: boolean;
  follow_prompt_message?: string | null;
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
interface DecryptedAccount {
  id: string;
  ig_user_id: string;
  encrypted_access_token: string;
  ig_username?: string;
}

/**
 * Builds the final message string containing the final message and redirect-wrapped links.
 */
async function buildFinalMessage(automation: InstagramAutomation): Promise<string> {
  const finalMsg = automation.message || '';
  const links = automation.links || [];
  let fullMessage = finalMsg;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (links.length > 0) {
    const trackingLinks: string[] = [];
    for (const link of links) {
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
  return fullMessage;
}

/**
 * Verifies follow status of the user using the Instagram profile API.
 */
async function checkFollowStatus(
  senderId: string,
  accessToken: string,
  contactId: string,
  automationId: string
): Promise<boolean> {
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
        contact_id: contactId,
        automation_id: automationId,
        direction: 'out',
        content: `Follow check passed (failed open on error: ${profileData.error.message})`,
        status: 'follow_passed',
      });
      return true; // Fail open
    }

    if (profileData.follows_business === undefined) {
      console.warn(
        `[Meta API Warning] 'follows_business' field is missing or unavailable. Meta may have deprecated it or client permissions are insufficient. Defaulting to 'true' (fail open).`
      );
      await supabase.from('message_log').insert({
        contact_id: contactId,
        automation_id: automationId,
        direction: 'out',
        content: 'Follow check passed (failed open due to missing field)',
        status: 'follow_passed',
      });
      return true; // Fail open
    }

    const isFollowing = !!profileData.follows_business;
    await supabase.from('message_log').insert({
      contact_id: contactId,
      automation_id: automationId,
      direction: 'out',
      content: isFollowing ? 'Follow check passed' : 'Follow check failed',
      status: isFollowing ? 'follow_passed' : 'follow_failed',
    });
    return isFollowing;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Meta API Error] Failed to fetch user profile:`, err);
    await supabase.from('message_log').insert({
      contact_id: contactId,
      automation_id: automationId,
      direction: 'out',
      content: `Follow check passed (failed open on exception: ${errorMsg})`,
      status: 'follow_passed',
    });
    return true; // Fail open
  }
}

/**
 * Sends a private comment reply immediately or queues it if rate limits are exceeded.
 */
async function sendOrQueueReply(
  account: DecryptedAccount,
  accessToken: string,
  contactId: string,
  comment: InstagramComment,
  automation: InstagramAutomation,
  text: string,
  quickReplies?: Array<{ content_type: string; title: string; payload: string }>
) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('message_log')
    .select('id, contacts!inner(account_id)', { count: 'exact', head: true })
    .eq('direction', 'out')
    .eq('contacts.account_id', account.id)
    .gt('created_at', oneHourAgo);
  
  const currentHourSends = count || 0;
  const isRateLimitExceeded = currentHourSends >= 200;

  if (!isRateLimitExceeded) {
    console.log(`[Meta API] Sending private reply for comment ${comment.id}`);
    const body: {
      recipient: { comment_id: string };
      message: { text: string; quick_replies?: Array<{ content_type: string; title: string; payload: string }> };
      access_token: string;
    } = {
      recipient: { comment_id: comment.id },
      message: { text },
      access_token: accessToken,
    };
    
    if (quickReplies && quickReplies.length > 0) {
      body.message.quick_replies = quickReplies;
    }

    const dmRes = await fetchWithBackoff(
      `https://graph.instagram.com/v21.0/${account.ig_user_id}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    const dmData = await dmRes.json();
    if (dmData.error) {
      console.error(`[Meta API Error] Failed to send private DM:`, dmData.error.message);
      await supabase.from('message_log').insert({
        contact_id: contactId,
        automation_id: automation.id,
        direction: 'out',
        content: text,
        status: `failed: ${dmData.error.message}`,
      });
    } else {
      console.log(`[Meta API] Private DM sent successfully for comment ${comment.id}`);
      await supabase.from('message_log').insert({
        contact_id: contactId,
        automation_id: automation.id,
        direction: 'out',
        content: text,
        status: 'sent',
      });
    }
  } else {
    console.log(`[Send Queue] Rate limit of 200 reached. Queueing message for comment ${comment.id}`);
    await supabase.from('send_queue').insert({
      account_id: account.id,
      contact_id: contactId,
      payload: {
        comment_id: comment.id,
        message: text,
        quick_replies: quickReplies,
        comment_created_time: comment.created_time,
      },
      scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      sent: false,
      attempts: 0,
    });
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
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id, encrypted_access_token, ig_user_id, ig_username')
      .eq('id', automation.account_id)
      .single();

    if (accountError || !accountData) {
      throw new Error(`Account not found or access denied: ${automation.account_id}`);
    }

    const account: DecryptedAccount = accountData;
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

    // 2. Post a random public reply variant immediately (Unconditional & first action)
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
      .select('id, email')
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

    // 4. Evaluate gates for the one-shot private reply
    const requiresFollow = automation.requires_follow ?? false;

    let messageText = '';
    let quickReplies: Array<{ content_type: string; title: string; payload: string }> | undefined = undefined;
    let nextStep = 'completed';

    if (requiresFollow) {
      // Bug fix: Check actual follow status FIRST before deciding what to send.
      // Previously, the follow prompt was sent unconditionally — even to existing followers.
      // Now: followers get the link immediately, non-followers get the prompt.
      console.log(`[Instagram Trigger] Follow gate enabled — checking if ${comment.from.id} is already following...`);
      const isAlreadyFollowing = await checkFollowStatus(
        comment.from.id,
        accessToken,
        contactId,
        automation.id
      );

      if (isAlreadyFollowing) {
        // Already a follower — skip the gate and send the link directly
        console.log(`[Instagram Trigger] User is already following. Sending final message directly.`);
        const finalMsg = await buildFinalMessage(automation);
        messageText = finalMsg;
        nextStep = 'completed';
      } else {
        // Not a follower — ask them to follow first
        console.log(`[Instagram Trigger] User is not following. Sending follow prompt.`);
        let followPrompt = automation.follow_prompt_message || 'Please follow our profile first to get the link!';
        if (account.ig_username) {
          followPrompt += `\n\n👉 Follow here: https://www.instagram.com/${account.ig_username}`;
        }
        messageText = followPrompt;
        quickReplies = [
          {
            content_type: 'text',
            title: 'I followed!',
            payload: 'I_FOLLOWED',
          },
        ];
        nextStep = 'awaiting_follow_recheck';
      }
    } else {
      const finalMsg = await buildFinalMessage(automation);
      messageText = finalMsg;
      nextStep = 'completed';
    }

    // 5. Send or queue the private reply message (one-shot comment reply limit)
    await sendOrQueueReply(account, accessToken, contactId, comment, automation, messageText, quickReplies);

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
      current_step: nextStep,
      window_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
  console.log(`[DM Handler] Received message from ${senderId}, looking up contact...`);
  try {
    console.log(`[Instagram Webhook DM] Received message from ${senderId} to ${recipientId}: "${text}"`);

    // 1. Resolve connected account (single-tenant routing)
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id, encrypted_access_token, ig_user_id, ig_username')
      .limit(1)
      .maybeSingle();

    if (accountError || !accountData) {
      console.warn(`[Instagram Webhook DM] Account not found in database: ${accountError?.message || 'Empty accounts table'}`);
      return;
    }

    const account: DecryptedAccount = accountData;

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

    // 3. Fetch ALL active conversation states for this contact.
    //    A user may have commented on multiple reels, each with its own automation.
    //    We must process every pending state, not just the most recent one.
    const { data: allStatesData, error: stateError } = await supabase
      .from('conversation_state')
      .select('*, automations(*)')
      .eq('contact_id', contact.id)
      .gt('window_expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (stateError || !allStatesData || allStatesData.length === 0) {
      console.log(`[Instagram Webhook DM] No active conversation states for contact: ${contact.id}`);
      return;
    }

    const allStates = allStatesData as unknown as ConversationStateWithAutomation[];
    const accessToken = decrypt(account.encrypted_access_token);

    // Log the incoming DM once, attributed to the most recent automation
    const primaryAutomation = allStates[0].automations;
    if (primaryAutomation) {
      await supabase.from('message_log').insert({
        contact_id: contact.id,
        automation_id: primaryAutomation.id,
        direction: 'in',
        content: text,
        status: 'dm_received',
      });
    }

    // Helper to send a DM and log it, attributed to the correct automation
    const sendDmAndLog = async (
      msgText: string,
      automationId: string,
      quickReplies?: Array<{ content_type: string; title: string; payload: string }>
    ) => {
      const body: {
        recipient: { id: string };
        message: { text: string; quick_replies?: Array<{ content_type: string; title: string; payload: string }> };
        access_token: string;
      } = {
        recipient: { id: senderId },
        message: { text: msgText },
        access_token: accessToken,
      };

      if (quickReplies && quickReplies.length > 0) {
        body.message.quick_replies = quickReplies;
      }

      const dmRes = await fetchWithBackoff(
        `https://graph.instagram.com/v21.0/${account.ig_user_id}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      
      const dmData = await dmRes.json();
      if (dmData.error) {
        console.error(`[Meta API Error] Failed to send DM reply:`, dmData.error.message);
        await supabase.from('message_log').insert({
          contact_id: contact.id,
          automation_id: automationId,
          direction: 'out',
          content: msgText,
          status: `failed: ${dmData.error.message}`,
        });
      } else {
        await supabase.from('message_log').insert({
          contact_id: contact.id,
          automation_id: automationId,
          direction: 'out',
          content: msgText,
          status: 'sent',
        });
      }
    };

    // 4. Collect all states that are still waiting for the user to follow
    const pendingFollowStates = allStates.filter(
      (s) => s.current_step === 'awaiting_follow_recheck' && s.automations
    );

    if (pendingFollowStates.length === 0) {
      console.log(`[Instagram Webhook DM] No states awaiting follow recheck for contact: ${contact.id}`);
      return;
    }

    // 5. State machine — handle "I followed!" reply
    const isTapFollowed =
      text.trim().toLowerCase() === 'i followed!' ||
      text.trim().toLowerCase() === 'i followed! ✅' ||
      text.trim() === 'I_FOLLOWED';

    if (!isTapFollowed) {
      console.log(`[Instagram Webhook DM] Message is not a follow confirmation, ignoring.`);
      return;
    }

    // Check follow status ONCE — reuse result for all pending automations
    console.log(`[Instagram Webhook DM] Checking follow status for ${pendingFollowStates.length} pending automation(s)...`);
    const isFollowingNow = await checkFollowStatus(
      senderId,
      accessToken,
      contact.id,
      pendingFollowStates[0].automations!.id
    );

    if (isFollowingNow) {
      // User is following — deliver every pending automation's link in sequence
      console.log(`[Instagram Webhook DM] User is following. Sending links for ${pendingFollowStates.length} automation(s).`);
      for (const state of pendingFollowStates) {
        const automation = state.automations!;
        const finalMsg = await buildFinalMessage(automation);
        await sendDmAndLog(finalMsg, automation.id);
        await supabase
          .from('conversation_state')
          .update({ current_step: 'completed' })
          .eq('id', state.id);
        console.log(`[Instagram Webhook DM] Delivered link for automation ${automation.id} and marked completed.`);
      }
    } else {
      // User is NOT following — send ONE re-prompt to avoid spamming.
      // Use the most recent automation's follow prompt message.
      console.log(`[Instagram Webhook DM] User is not following. Sending a single re-prompt.`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const mostRecentAutomation = pendingFollowStates[0].automations!;
      let followPrompt = mostRecentAutomation.follow_prompt_message || 'Please follow our profile first to get the link!';
      if (account.ig_username) {
        followPrompt += `\n\n👉 Follow here: https://www.instagram.com/${account.ig_username}`;
      }
      await sendDmAndLog(followPrompt, mostRecentAutomation.id, [
        {
          content_type: 'text',
          title: 'I followed! ✅',
          payload: 'I_FOLLOWED',
        },
      ]);
      // All states remain on awaiting_follow_recheck — they will be retried next time
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

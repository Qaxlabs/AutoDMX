import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { handleCommentTrigger, handleMessageEvent } from '@/lib/instagram';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Webhook GET] Verification handshake successful');
    return new Response(challenge, { status: 200 });
  }

  console.warn('[Webhook GET] Verification failed');
  return new Response('Verification token mismatch', { status: 403 });
}

export async function POST(request: NextRequest) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    return NextResponse.json({ error: 'META_APP_SECRET not configured' }, { status: 500 });
  }

  // 1. Read raw request body
  const rawBody = await request.text();

  // 2. Validate X-Hub-Signature-256 header
  const signatureHeader = request.headers.get('X-Hub-Signature-256');
  if (!signatureHeader) {
    console.warn('[Webhook POST] Missing X-Hub-Signature-256 header');
    return new Response('Missing signature', { status: 403 });
  }

  const [algorithm, signature] = signatureHeader.split('=');
  if (algorithm !== 'sha256' || !signature) {
    console.warn('[Webhook POST] Invalid signature format');
    return new Response('Invalid signature format', { status: 403 });
  }

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.warn('[Webhook POST] Signature mismatch');
    return new Response('Signature mismatch', { status: 403 });
  }

  // Signature verified! Parse payload.
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  // Check object is "instagram"
  if (payload.object !== 'instagram') {
    return NextResponse.json({ success: true, message: 'Non-instagram event ignored' });
  }

  const entries = payload.entry || [];

  for (const entry of entries) {
    const entryId = entry.id; // Instagram Business Account ID
    if (!entryId) continue;

    // Fetch the single connected account regardless of ID format (single-tenant routing)
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, webhook_account_id')
      .limit(1)
      .maybeSingle();

    if (accountError || !account) {
      console.warn(`[Webhook POST] No connected account found in database: ${accountError?.message || 'Empty accounts table'}`);
      continue;
    }

    // Auto-record the webhook namespace ID if not already set
    if (!account.webhook_account_id) {
      console.log(`[Webhook POST] Storing webhook namespace ID ${entryId} on account ${account.id}`);
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ webhook_account_id: entryId })
        .eq('id', account.id);
      
      if (updateError) {
        console.error(`[Webhook POST] Failed to update webhook_account_id:`, updateError.message);
      }
    }

    // A. Parse and process direct DMs inside entry.messaging
    const messagingList = entry.messaging || [];
    for (const msg of messagingList) {
      const senderId = msg.sender?.id;
      const recipientId = msg.recipient?.id;
      const messageText = msg.message?.text || '';
      if (senderId && recipientId && msg.message) {
        try {
          await handleMessageEvent(senderId, recipientId, messageText);
        } catch (msgErr) {
          console.error('[Webhook POST] handleMessageEvent failed:', msgErr);
        }
      }
    }

    // B. Parse and process comments / messaging events inside entry.changes
    const changes = entry.changes || [];
    for (const change of changes) {
      if (change.field === 'messages') {
        const messageValue = change.value;
        if (messageValue) {
          const senderId = messageValue.sender?.id;
          const recipientId = messageValue.recipient?.id;
          const messageText = messageValue.message?.text || '';
          if (senderId && recipientId) {
            try {
              await handleMessageEvent(senderId, recipientId, messageText);
            } catch (msgErr) {
              console.error('[Webhook POST] handleMessageEvent failed:', msgErr);
            }
          }
        }
        continue;
      }

      if (change.field !== 'comments') continue;

      const commentValue = change.value;
      if (!commentValue || !commentValue.id) continue;

      // Deduplication check: Attempt to insert comment_id into processed_comments
      const { error: insertError } = await supabase
        .from('processed_comments')
        .insert({ comment_id: commentValue.id });

      if (insertError) {
        if (insertError.code === '23505') {
          // Unique constraint violation - Duplicate comment, ignore it
          console.log(`[Webhook POST] Duplicate comment ${commentValue.id} detected, ignoring.`);
          continue; // Skip this comment but continue processing other changes/entries
        } else {
          // Other DB errors (e.g. timeout, connection issue)
          console.error(`[Webhook POST] Database error inserting comment_id ${commentValue.id}:`, insertError);
          // Return 500 to let the provider retry later
          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
      }

      const mediaId = commentValue.media?.id;
      const commentText = commentValue.text || '';

      if (!mediaId) continue;

      // Fetch active comment automations for this account
      const { data: automations, error: automationsError } = await supabase
        .from('automations')
        .select('*')
        .eq('account_id', account.id)
        .eq('is_active', true)
        .eq('trigger_type', 'comment');

      if (automationsError || !automations) {
        console.error('[Webhook POST] Error fetching automations:', automationsError);
        continue;
      }

      for (const automation of automations) {
        // Match scope: specific post or any post
        const matchesScope =
          (automation.media_scope === 'specific' && automation.media_id === mediaId) ||
          automation.media_scope === 'any';

        if (!matchesScope) continue;

        // Match keywords: case-insensitive substring or empty keywords list (match all)
        const keywordsList = automation.keywords || [];
        const hasMatchAnyComment = 'match_any_comment' in automation && Boolean((automation as Record<string, unknown>).match_any_comment);

        let matchesKeywords = false;
        if (keywordsList.length === 0 || hasMatchAnyComment) {
          matchesKeywords = true;
        } else {
          matchesKeywords = keywordsList.some((keyword: string) =>
            commentText.toLowerCase().includes(keyword.toLowerCase())
          );
        }

        if (matchesKeywords) {
          try {
            await handleCommentTrigger(commentValue, automation);
          } catch (triggerError) {
            console.error('[Webhook POST] handleCommentTrigger failed:', triggerError);
          }
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}

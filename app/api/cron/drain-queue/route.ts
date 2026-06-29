import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/crypto';

interface QueueItem {
  id: string;
  account_id: string;
  contact_id: string;
  payload: {
    comment_id?: string;
    message?: string;
  };
  attempts: number;
  scheduled_for: string;
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

async function handleCron(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured on host' }, { status: 500 });
  }

  // Verify auth secret header
  const clientSecret =
    request.headers.get('x-cron-secret') ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!clientSecret || clientSecret !== cronSecret) {
    console.warn('[Cron Drain] Unauthorized access attempt');
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('[Cron Drain] Starting queue execution...');

  // Pull up to 50 unsent rows from send_queue scheduled to run now or earlier
  const { data: queueData, error: fetchError } = await supabase
    .from('send_queue')
    .select('*')
    .eq('sent', false)
    .lte('scheduled_for', new Date().toISOString())
    .lt('attempts', 5)
    .order('scheduled_for', { ascending: true })
    .limit(50);

  if (fetchError) {
    console.error('[Cron Drain Error] Failed to fetch queue:', fetchError.message);
    return NextResponse.json({ error: `Failed to fetch queue: ${fetchError.message}` }, { status: 500 });
  }

  const queueItems = (queueData as unknown as QueueItem[]) || [];
  console.log(`[Cron Drain] Found ${queueItems.length} items to process.`);

  const results = [];
  const accountSendCounts: Record<string, number> = {};

  for (const item of queueItems) {
    const accountId = item.account_id;

    try {
      // 1. Resolve and cache the account's current hourly send count to respect the 200 limit
      if (accountSendCounts[accountId] === undefined) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count, error: countError } = await supabase
          .from('message_log')
          .select('id, contacts!inner(account_id)', { count: 'exact', head: true })
          .eq('direction', 'out')
          .eq('contacts.account_id', accountId)
          .gt('created_at', oneHourAgo);

        if (countError) {
          console.error(`[Cron Drain] Failed to fetch hourly send count for account ${accountId}:`, countError.message);
          accountSendCounts[accountId] = 0; // fallback
        } else {
          accountSendCounts[accountId] = count || 0;
        }
      }

      const currentSends = accountSendCounts[accountId];
      if (currentSends >= 200) {
        console.warn(`[Cron Drain] Hourly send limit of 200 reached for account ${accountId}. Skipping item ${item.id}.`);
        results.push({ id: item.id, status: 'skipped_hourly_limit_reached' });
        continue;
      }

      // 2. Fetch and decrypt credentials
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('encrypted_access_token, ig_user_id')
        .eq('id', accountId)
        .single();

      if (accountError || !account) {
        throw new Error(`Connected account not found or access denied: ${accountId}`);
      }

      const accessToken = decrypt(account.encrypted_access_token);
      const payload = item.payload as {
        comment_id: string;
        message: string;
        comment_created_time?: number;
      };
      const commentId = payload.comment_id;
      const message = payload.message;

      if (!commentId || !message) {
        throw new Error('Queue item payload is missing comment_id or message body');
      }

      // Check if the comment creation time is older than 7 days
      if (payload.comment_created_time) {
        const sevenDaysInSeconds = 7 * 24 * 60 * 60;
        const nowInSeconds = Math.floor(Date.now() / 1000);
        if (nowInSeconds - payload.comment_created_time > sevenDaysInSeconds) {
          console.warn(`[Cron Drain] Queued comment ${commentId} is older than 7 days. Dropping from queue.`);
          await supabase
            .from('send_queue')
            .update({ sent: false, attempts: 5 })
            .eq('id', item.id);
          
          results.push({ id: item.id, status: 'failed_comment_too_old' });
          continue;
        }
      }

      // 3. Post private reply to Instagram Graph API
      console.log(`[Cron Drain] Dispatching DM reply to comment ${commentId} for contact ${item.contact_id}`);
      const dmRes = await fetchWithBackoff(
        `https://graph.instagram.com/v21.0/${account.ig_user_id}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { comment_id: commentId },
            message: { text: message },
            access_token: accessToken,
          }),
        }
      );

      const dmData = await dmRes.json();
      if (dmData.error) {
        throw new Error(`Meta API Error: ${dmData.error.message}`);
      }

      // 4. Update queue row as sent
      await supabase
        .from('send_queue')
        .update({ sent: true, attempts: item.attempts + 1 })
        .eq('id', item.id);

      // 5. Write log to message_log
      await supabase.from('message_log').insert({
        contact_id: item.contact_id,
        direction: 'out',
        content: message,
        status: 'sent',
      });

      // Increment memory send tracker
      accountSendCounts[accountId]++;
      results.push({ id: item.id, status: 'sent' });
      console.log(`[Cron Drain] Item ${item.id} sent successfully`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[Cron Drain Exception] Failed to process item ${item.id}:`, errorMsg);

      const newAttempts = item.attempts + 1;
      const isDropped = newAttempts >= 5;

      // Update attempts in queue
      await supabase
        .from('send_queue')
        .update({ attempts: newAttempts })
        .eq('id', item.id);

      // Log failure event
      await supabase.from('message_log').insert({
        contact_id: item.contact_id,
        direction: 'out',
        content: item.payload?.message || 'Queued DM Delivery Failed',
        status: isDropped ? `failed_dropped: ${errorMsg}` : `failed_attempt_${newAttempts}: ${errorMsg}`,
      });

      results.push({
        id: item.id,
        status: 'failed',
        attempts: newAttempts,
        dropped: isDropped,
        error: errorMsg,
      });
    }
  }

  return NextResponse.json({
    success: true,
    processed: results.length,
    results,
  });
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}

export async function GET(request: NextRequest) {
  return handleCron(request);
}

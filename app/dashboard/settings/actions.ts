'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { encrypt } from '@/lib/crypto';
import { createClient } from '@/utils/supabase/server';

type InstagramMeResponse =
  | {
      id?: string;
      username?: string;
      error?: {
        message?: string;
      };
    }
  | null;

function redirectWithError(message: string): never {
  redirect(`/dashboard/settings?error=${encodeURIComponent(message)}`);
}

export async function refreshInstagramCredentials(formData: FormData) {
  const accountId = String(formData.get('accountId') || '');
  if (!accountId) {
    redirectWithError('Missing Instagram account id.');
  }

  const token = process.env.META_INITIAL_ACCESS_TOKEN;
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!token || !appId || !appSecret) {
    redirectWithError(
      'Missing META_INITIAL_ACCESS_TOKEN, META_APP_ID, or META_APP_SECRET in .env.local.'
    );
  }

  const supabase = createClient();
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('id, ig_user_id, ig_username')
    .eq('id', accountId)
    .single();

  if (accountError || !account) {
    redirectWithError('Instagram account not found.');
  }

  const meUrl = new URL('https://graph.instagram.com/v21.0/me');
  meUrl.searchParams.set('fields', 'id,username');
  meUrl.searchParams.set('access_token', token);

  let meData: InstagramMeResponse = null;
  try {
    const meRes = await fetch(meUrl, { cache: 'no-store' });
    meData = (await meRes.json()) as InstagramMeResponse;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    redirectWithError(`Could not verify the Instagram token: ${message}`);
  }

  if (meData?.error) {
    redirectWithError(
      `Instagram token rejected: ${meData.error.message || 'Unknown Meta API error.'}`
    );
  }

  if (!meData?.id || !meData.username) {
    redirectWithError('Instagram verification did not return an id and username.');
  }

  if (meData.id !== account.ig_user_id) {
    redirectWithError(
      `The env token belongs to @${meData.username}, but this row is for @${account.ig_username}.`
    );
  }

  const { error: updateError } = await supabase
    .from('accounts')
    .update({
      ig_username: meData.username,
      encrypted_access_token: encrypt(token),
      app_id: appId,
      encrypted_app_secret: encrypt(appSecret),
    })
    .eq('id', account.id);

  if (updateError) {
    redirectWithError(`Failed to update credentials: ${updateError.message}`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings');
  redirect(
    `/dashboard/settings?success=${encodeURIComponent('Instagram credentials refreshed.')}`
  );
}

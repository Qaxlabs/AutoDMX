'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { encrypt } from '@/lib/crypto';

export async function connectInstagram(formData: FormData) {
  const appId = formData.get('appId') as string;
  const appSecret = formData.get('appSecret') as string;
  const fbPageId = formData.get('fbPageId') as string;
  const accessToken = formData.get('accessToken') as string;

  if (!appId || !appSecret || !fbPageId || !accessToken) {
    return redirect('/dashboard/settings?error=All fields are required.');
  }

  let igUserId = '';
  let igUsername = '';

  // 1. Resolve Instagram Business Account from Facebook Page
  try {
    const pageRes = await fetch(
      `https://graph.facebook.com/v19.0/${fbPageId}?fields=instagram_business_account{id,username}&access_token=${accessToken}`
    );
    const pageData = await pageRes.json();

    if (pageData.error) {
      return redirect(
        `/dashboard/settings?error=${encodeURIComponent(
          `Facebook API Error: ${pageData.error.message}`
        )}`
      );
    }

    if (!pageData.instagram_business_account) {
      return redirect(
        '/dashboard/settings?error=No Instagram Business Account is linked to this Facebook Page. Please ensure your Instagram Creator/Business account is linked to the Facebook Page.'
      );
    }

    igUserId = pageData.instagram_business_account.id;
    igUsername = pageData.instagram_business_account.username;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return redirect(
      `/dashboard/settings?error=${encodeURIComponent(
        `Failed to query Facebook API: ${message}`
      )}`
    );
  }

  // 2. Verify token works directly on the Instagram Business Account
  try {
    const igRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}?fields=id,username&access_token=${accessToken}`
    );
    const igData = await igRes.json();

    if (igData.error) {
      return redirect(
        `/dashboard/settings?error=${encodeURIComponent(
          `Instagram Verification Error: ${igData.error.message}`
        )}`
      );
    }

    if (igData.id !== igUserId || igData.username !== igUsername) {
      return redirect(
        '/dashboard/settings?error=Verification response mismatch. Please check your credentials.'
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return redirect(
      `/dashboard/settings?error=${encodeURIComponent(
        `Failed to verify token with Instagram API: ${message}`
      )}`
    );
  }

  // 3. Encrypt access token and app secret
  let encryptedAccessToken = '';
  let encryptedAppSecret = '';
  try {
    encryptedAccessToken = encrypt(accessToken);
    encryptedAppSecret = encrypt(appSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return redirect(
      `/dashboard/settings?error=${encodeURIComponent(
        `Encryption failed: ${message}`
      )}`
    );
  }

  // 4. Save to database
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { error: dbError } = await supabase.from('accounts').insert({
    user_id: user.id,
    ig_user_id: igUserId,
    ig_username: igUsername,
    encrypted_access_token: encryptedAccessToken,
    fb_page_id: fbPageId,
    app_id: appId,
    encrypted_app_secret: encryptedAppSecret,
  });

  if (dbError) {
    return redirect(
      `/dashboard/settings?error=${encodeURIComponent(
        `Database insertion failed: ${dbError.message}`
      )}`
    );
  }

  revalidatePath('/dashboard/settings');
  return redirect('/dashboard/settings?success=1');
}

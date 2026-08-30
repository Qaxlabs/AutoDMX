import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { decrypt } from '@/lib/crypto';
import { initializeAccountIfNeeded } from '@/lib/instagram';
import DashboardGrid from './DashboardGrid';
import { AppShell } from '../_components/AppShell';
import { AlertCircle, RefreshCw, KeyRound } from 'lucide-react';

type Post = {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

function getInstagramSyncMessage(apiError: string) {
  const normalized = apiError.toLowerCase();
  const isInvalidToken =
    normalized.includes('error validating access token') ||
    normalized.includes('session has been invalidated') ||
    normalized.includes('access token');

  if (isInvalidToken) {
    return {
      title: 'Instagram token needs refresh',
      body:
        'The saved Instagram access token is no longer valid. Generate a new long-lived token, update .env.local, then refresh it from Settings.',
      action: 'Open settings',
    };
  }

  return {
    title: 'Failed to sync with Instagram',
    body: 'Instagram could not return your latest posts and reels right now.',
    action: 'Check credentials',
  };
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { accountId?: string };
}) {
  const supabase = createClient();

  // 1. Auto-initialize account if needed using environment variables
  const initResult = await initializeAccountIfNeeded();
  let initError: string | null = null;
  if (!initResult.success && initResult.error) {
    initError = initResult.error;
  }

  // 2. Fetch connected accounts
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id, ig_username, ig_user_id, encrypted_access_token')
    .order('created_at', { ascending: false });

  if (accountsError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
          <h1 className="text-lg font-semibold text-red-700 dark:text-red-400">Database error</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{accountsError.message}</p>
        </div>
      </div>
    );
  }

  // Handle empty state (or initialization failure)
  if (!accounts || accounts.length === 0) {
    return (
      <AppShell variant="dashboard" activeNav="dashboard">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center sm:px-8">
          {initError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-8 text-sm dark:border-red-900/40 dark:bg-red-950/20">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Instagram connection failed
              </h3>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">{initError}</p>
              <p className="mt-4 text-xs leading-relaxed text-neutral-500 dark:text-neutral-500">
                Please configure{' '}
                <code className="rounded bg-neutral-200/80 px-1.5 py-0.5 font-mono text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  META_INITIAL_ACCESS_TOKEN
                </code>
                ,{' '}
                <code className="rounded bg-neutral-200/80 px-1.5 py-0.5 font-mono text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  META_APP_ID
                </code>
                , and{' '}
                <code className="rounded bg-neutral-200/80 px-1.5 py-0.5 font-mono text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  META_APP_SECRET
                </code>{' '}
                in <code className="font-mono text-neutral-700 dark:text-neutral-300">.env.local</code>{' '}
                and reload the dashboard.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <RefreshCw className="h-6 w-6 animate-spin text-neutral-700 dark:text-neutral-300" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                Setting things up
              </h2>
              <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
                Connecting your initial Instagram account. One moment...
              </p>
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  // 2. Select active account
  const activeAccount =
    accounts.find((acc) => acc.id === searchParams.accountId) || accounts[0];

  // 3. Decrypt active account token
  let decryptedToken = '';
  try {
    decryptedToken = decrypt(activeAccount.encrypted_access_token);
  } catch {
    return (
      <AppShell variant="dashboard" activeNav="dashboard">
        <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Decryption error
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Failed to decrypt Instagram access token. Try reconnecting your
            account.
          </p>
          <Link
            href="/dashboard/settings"
            className="btn-primary mt-6 px-5 py-2.5 text-sm"
          >
            Go to settings
          </Link>
        </div>
      </AppShell>
    );
  }

  // 4. Fetch existing specific automations
  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .eq('account_id', activeAccount.id)
    .eq('media_scope', 'specific');

  // 5. Fetch Instagram posts & reels
  let media: Post[] = [];
  let apiError: string | null = null;

  try {
    const mediaRes = await fetch(
      `https://graph.instagram.com/v21.0/${activeAccount.ig_user_id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=24&access_token=${decryptedToken}`,
      { cache: 'no-store' }
    );
    const mediaData = await mediaRes.json();

    if (mediaData.error) {
      apiError = `Instagram API Error: ${mediaData.error.message}`;
    } else {
      media = mediaData.data || [];
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    apiError = `Network error fetching Instagram media: ${message}`;
  }

  return (
    <AppShell variant="dashboard" activeNav="dashboard">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <PageHeader
          title="Overview"
          subtitle="Select a post or reel to set up automated comment-to-DM rules."
        />

        {apiError && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white">
                {getInstagramSyncMessage(apiError).title}
              </h4>
              <p className="mt-1 text-xs text-neutral-700 dark:text-neutral-300">
                {getInstagramSyncMessage(apiError).body}
              </p>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                Details: {apiError}
              </p>
              <Link
                href="/dashboard/settings"
                className="mt-3 inline-block text-xs font-semibold text-neutral-900 underline dark:text-white hover:opacity-80"
              >
                {getInstagramSyncMessage(apiError).action} -&gt;
              </Link>
            </div>
          </div>
        )}

        {!apiError && (
          <DashboardGrid
            media={media}
            automations={automations || []}
            accountId={activeAccount.id}
            accounts={accounts.map((a) => ({
              id: a.id,
              ig_username: a.ig_username,
              ig_user_id: a.ig_user_id,
            }))}
          />
        )}
      </div>
    </AppShell>
  );
}

function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
    </div>
  );
}

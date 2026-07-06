import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { decrypt } from '@/lib/crypto';
import { initializeAccountIfNeeded } from '@/lib/instagram';
import DashboardGrid from './DashboardGrid';
import { AppShell } from '../_components/AppShell';

type Post = {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

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
        <h1 className="text-xl font-semibold text-red-400">Database error</h1>
        <p className="mt-2 text-sm text-slate-400">{accountsError.message}</p>
      </div>
    );
  }

  // Handle empty state (or initialization failure)
  if (!accounts || accounts.length === 0) {
    return (
      <AppShell variant="dashboard" activeNav="dashboard">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center sm:px-8">
          {initError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-sm">
              <svg
                className="mx-auto mb-4 h-10 w-10 text-red-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              <h3 className="text-lg font-semibold text-white">
                Instagram connection failed
              </h3>
              <p className="mt-1 text-xs text-slate-400">{initError}</p>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                Please configure{' '}
                <code className="rounded bg-ink-900 px-1.5 py-0.5 font-mono text-brand-300">
                  META_INITIAL_ACCESS_TOKEN
                </code>
                ,{' '}
                <code className="rounded bg-ink-900 px-1.5 py-0.5 font-mono text-brand-300">
                  META_APP_ID
                </code>
                , and{' '}
                <code className="rounded bg-ink-900 px-1.5 py-0.5 font-mono text-brand-300">
                  META_APP_SECRET
                </code>{' '}
                in <code className="font-mono text-slate-400">.env.local</code>{' '}
                and reload the dashboard.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
                <svg
                  className="h-7 w-7 animate-spin text-brand-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Setting things up
              </h2>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Connecting your initial Instagram account. One moment…
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
          <h1 className="text-xl font-semibold text-red-400">
            Decryption error
          </h1>
          <p className="mt-2 text-sm text-slate-400">
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
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <div>
              <h4 className="font-semibold text-white">
                Failed to sync with Instagram
              </h4>
              <p className="mt-1 text-xs text-slate-400">{apiError}</p>
              <Link
                href="/dashboard/settings"
                className="mt-3 inline-block text-xs font-semibold text-brand-300 hover:text-brand-200"
              >
                Update credentials in settings →
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
    <div className="mb-10">
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        {title}
      </h1>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { AppShell } from '../../_components/AppShell';
import { SocialLinks } from '../../_components/SocialLinks';
import { refreshInstagramCredentials } from './actions';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  const supabase = createClient();

  // Fetch connected accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, ig_user_id, ig_username, fb_page_id, app_id, created_at')
    .order('created_at', { ascending: false });

  return (
    <AppShell variant="dashboard" activeNav="settings">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8">
          <p className="text-[11px] font-mono font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            Workspace
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Your connected accounts, credentials, and project information.
          </p>
        </div>

        {searchParams.error && (
          <div className="mb-8 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/60 p-3.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{decodeURIComponent(searchParams.error)}</span>
          </div>
        )}

        {searchParams.success && (
          <div className="mb-8 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{decodeURIComponent(searchParams.success)}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Connected Accounts List */}
          <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
            <header className="flex items-center justify-between border-b border-neutral-200/80 p-5 dark:border-neutral-800">
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Connected Instagram accounts
                </h2>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  Meta tokens are encrypted with AES-256-GCM at rest in Supabase.
                </p>
              </div>
              <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-[10px] font-mono font-medium text-neutral-700 uppercase dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                {accounts?.length ?? 0} active
              </span>
            </header>

            {!accounts || accounts.length === 0 ? (
              <div className="m-5 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-12 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/30 dark:text-neutral-400">
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                  No Instagram accounts connected yet.
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-500">
                  Provide valid Meta Graph API keys in environment variables
                  to initiate your first account connection automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-neutral-200/80 text-[10px] font-mono font-medium tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:text-neutral-400">
                      <th className="px-6 py-3.5">IG Username</th>
                      <th className="px-6 py-3.5">IG User ID</th>
                      <th className="px-6 py-3.5">Meta App ID</th>
                      <th className="px-6 py-3.5">Date connected</th>
                      <th className="px-6 py-3.5 text-right">Token</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/70 text-sm dark:divide-neutral-800">
                    {accounts.map((account) => (
                      <tr
                        key={account.id}
                        className="transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40"
                      >
                        <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                          <span className="inline-flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            @{account.ig_username}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                          {account.ig_user_id}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                          {account.app_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date(account.created_at).toLocaleDateString(
                            undefined,
                            { year: 'numeric', month: 'short', day: 'numeric' }
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <form action={refreshInstagramCredentials}>
                            <input type="hidden" name="accountId" value={account.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-900 dark:hover:text-white"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Refresh token
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Environment / setup guide */}
          <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
            <header className="border-b border-neutral-200/80 p-5 dark:border-neutral-800">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Meta API credentials
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Configure these in <code className="font-mono text-neutral-800 dark:text-neutral-200">.env.local</code>{' '}
                and use Refresh token above to update the encrypted value in Supabase.
              </p>
            </header>
            <div className="grid gap-3 p-5 sm:grid-cols-3">
              {[
                { name: 'META_APP_ID', desc: 'Your Meta app ID' },
                { name: 'META_APP_SECRET', desc: 'Your Meta app secret' },
                {
                  name: 'META_INITIAL_ACCESS_TOKEN',
                  desc: 'A long-lived user token',
                },
              ].map((v) => (
                <div
                  key={v.name}
                  className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/60"
                >
                  <code className="text-xs font-mono font-semibold text-neutral-900 dark:text-white">
                    {v.name}
                  </code>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* About / community */}
          <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
            <header className="border-b border-neutral-200/80 p-5 dark:border-neutral-800">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                About & community
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                AutoDMX is built and maintained by Qaxlabs.
              </p>
            </header>
            <div className="space-y-4 p-5">
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Follow for tutorials, behind-the-scenes updates, and to get
                notified when new features ship.
              </p>
              <SocialLinks />
              <div className="flex flex-wrap gap-2.5 pt-2">
                <Link
                  href="/privacy"
                  className="btn-secondary px-3.5 py-1.5 text-xs"
                >
                  Privacy policy
                </Link>
                <Link
                  href="/terms"
                  className="btn-secondary px-3.5 py-1.5 text-xs"
                >
                  Terms of service
                </Link>
                <Link
                  href="/data-deletion"
                  className="btn-secondary px-3.5 py-1.5 text-xs"
                >
                  Data deletion
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

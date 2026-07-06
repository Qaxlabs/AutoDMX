import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { AppShell } from '../../_components/AppShell';
import { SocialLinks } from '../../_components/SocialLinks';

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
        <div className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">
            Workspace
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Your connected accounts, integrations, and the team behind
            AutoDMX.
          </p>
        </div>

        {searchParams.error && (
          <div className="mb-8 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-sm text-red-300">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <span>{decodeURIComponent(searchParams.error)}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Connected Accounts List */}
          <section className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
            <header className="flex items-center justify-between border-b border-white/5 p-5">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Connected Instagram accounts
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Meta tokens are encrypted with AES-256-GCM at rest.
                </p>
              </div>
              <span className="rounded-full border border-white/8 bg-ink-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                {accounts?.length ?? 0} active
              </span>
            </header>

            {!accounts || accounts.length === 0 ? (
              <div className="m-5 rounded-xl border border-dashed border-white/8 bg-ink-900/40 px-6 py-12 text-center text-sm text-slate-500">
                <p className="font-semibold text-slate-300">
                  No Instagram accounts connected yet.
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                  Provide valid Meta Graph API keys in the environment variables
                  to initiate your first account connection automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      <th className="px-6 py-3.5">IG Username</th>
                      <th className="px-6 py-3.5">IG User ID</th>
                      <th className="px-6 py-3.5">Meta App ID</th>
                      <th className="px-6 py-3.5">Date connected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                    {accounts.map((account) => (
                      <tr
                        key={account.id}
                        className="transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-4 font-medium text-white">
                          <span className="inline-flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                            </span>
                            @{account.ig_username}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                          {account.ig_user_id}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                          {account.app_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(account.created_at).toLocaleDateString(
                            undefined,
                            { year: 'numeric', month: 'short', day: 'numeric' }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Environment / setup guide */}
          <section className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
            <header className="border-b border-white/5 p-5">
              <h2 className="text-base font-semibold text-white">
                Meta API credentials
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Set these in <code className="font-mono text-slate-300">.env.local</code>{' '}
                and reload the dashboard.
              </p>
            </header>
            <div className="grid gap-2 p-5 sm:grid-cols-3">
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
                  className="rounded-xl border border-white/8 bg-ink-900/60 p-3.5"
                >
                  <code className="text-xs font-mono text-brand-300">
                    {v.name}
                  </code>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* About / community */}
          <section className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
            <header className="border-b border-white/5 p-5">
              <h2 className="text-base font-semibold text-white">
                About & community
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                AutoDMX is built and maintained by Qaxlabs.
              </p>
            </header>
            <div className="space-y-4 p-5">
              <p className="text-sm leading-relaxed text-slate-300">
                Follow for tutorials, behind-the-scenes updates, and to get
                notified when new features ship.
              </p>
              <SocialLinks />
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/privacy"
                  className="btn-secondary px-3.5 py-2 text-xs"
                >
                  Privacy policy
                </Link>
                <Link
                  href="/terms"
                  className="btn-secondary px-3.5 py-2 text-xs"
                >
                  Terms of service
                </Link>
                <Link
                  href="/data-deletion"
                  className="btn-secondary px-3.5 py-2 text-xs"
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

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { connectInstagram } from './actions';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[30%] h-[30%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              AutoDMX
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
              Dashboard
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/dashboard/contacts" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
              Contacts
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/dashboard/analytics" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
              Analytics
            </Link>
            <span className="text-slate-700">|</span>
            <span className="text-sm font-medium text-slate-300">Settings</span>
          </div>
        </div>
      </header>

      {/* Settings Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Configure your API credentials and connect your social accounts.</p>
        </div>

        {/* Success/Error Alerts */}
        {searchParams.success && (
          <div className="mb-8 p-4 rounded-xl border border-green-500/30 bg-green-950/20 text-green-400 text-sm flex items-start gap-2 max-w-4xl">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Instagram account successfully connected and credentials encrypted!</span>
          </div>
        )}

        {searchParams.error && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-sm flex items-start gap-2 max-w-4xl">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{decodeURIComponent(searchParams.error)}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 items-start max-w-7xl">
          {/* Instructions Panel */}
          <div className="lg:col-span-1 p-6 rounded-2xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-100">Setup Instructions</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              AutoDMX is a Bring Your Own Keys (BYOK) system. You will need to obtain a Long-Lived Facebook/Instagram Access Token using Meta Developer Portal.
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-400 space-y-4">
              <li className="leading-relaxed">
                Go to the{' '}
                <a
                  href="https://developers.facebook.com/tools/explorer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:underline inline-flex items-center gap-0.5"
                >
                  Meta Graph API Explorer
                  <svg className="w-3 h-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>.
              </li>
              <li className="leading-relaxed">
                Select your Meta App and generate a <strong>User Access Token</strong> with the following scopes enabled:
                <div className="bg-slate-950 p-2 rounded mt-1.5 font-mono text-[10px] text-slate-300 select-all overflow-x-auto space-y-1">
                  <div>instagram_basic</div>
                  <div>instagram_manage_comments</div>
                  <div>instagram_manage_messages</div>
                  <div>pages_manage_metadata</div>
                  <div>pages_show_list</div>
                  <div>pages_read_engagement</div>
                </div>
              </li>
              <li className="leading-relaxed">
                Exchange the short-lived token for a <strong>Long-Lived Access Token</strong> (60 days expiry) under the Access Token Tool.
              </li>
              <li className="leading-relaxed">
                Ensure your Instagram Business account is connected to your Facebook Page in Page Settings.
              </li>
            </ol>
          </div>

          {/* Configuration Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-8 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-slate-100 mb-6">Connect Instagram</h2>
              <form action={connectInstagram} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="appId" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Meta App ID
                    </label>
                    <input
                      id="appId"
                      name="appId"
                      type="text"
                      required
                      placeholder="e.g. 123456789012345"
                      className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="appSecret" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Meta App Secret
                    </label>
                    <input
                      id="appSecret"
                      name="appSecret"
                      type="password"
                      required
                      placeholder="••••••••••••••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fbPageId" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Facebook Page ID
                    </label>
                    <input
                      id="fbPageId"
                      name="fbPageId"
                      type="text"
                      required
                      placeholder="e.g. 987654321012"
                      className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="accessToken" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Long-Lived Access Token
                  </label>
                  <textarea
                    id="accessToken"
                    name="accessToken"
                    required
                    rows={4}
                    placeholder="Paste your long-lived access token here..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all outline-none resize-none font-mono text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                >
                  Verify & Connect
                </button>
              </form>
            </div>

            {/* Connected Accounts List */}
            <div className="p-8 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-slate-100 mb-6">Connected Instagram Accounts</h2>

              {!accounts || accounts.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl text-slate-500">
                  No Instagram accounts connected yet. Complete the form above to connect your first account.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-4 pt-2 px-4">IG Username</th>
                        <th className="pb-4 pt-2 px-4">IG User ID</th>
                        <th className="pb-4 pt-2 px-4">Meta App ID</th>
                        <th className="pb-4 pt-2 px-4">Date Connected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-sm">
                      {accounts.map((account) => (
                        <tr key={account.id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="py-4 px-4 font-semibold text-slate-200">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                              @{account.ig_username}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-slate-400">{account.ig_user_id}</td>
                          <td className="py-4 px-4 font-mono text-xs text-slate-400">{account.app_id || 'N/A'}</td>
                          <td className="py-4 px-4 text-slate-400">
                            {new Date(account.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 mt-20">
        <p>© {new Date().getFullYear()} AutoDMX. Settings Area.</p>
      </footer>
    </div>
  );
}

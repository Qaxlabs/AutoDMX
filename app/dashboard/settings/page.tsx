import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

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
          <div className="flex items-center gap-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" title="System Status: Online" />
            <span className="text-xs text-slate-400">System Online</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {/* Page Title */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Settings</h1>
            <p className="text-sm text-slate-400 mt-1">Configure your system preferences and integrations.</p>
          </div>
        </div>

        {searchParams.error && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{decodeURIComponent(searchParams.error)}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Connected Accounts List */}
          <div className="p-8 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Connected Instagram Accounts</h2>

            {!accounts || accounts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-slate-500">
                <p className="font-semibold text-slate-400 mb-1">No Instagram accounts connected yet.</p>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Provide valid Meta Graph API keys in the environment variables to initiate your first account connection automatically.
                </p>
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
                            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse" />
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 mt-20">
        <p>© {new Date().getFullYear()} AutoDMX. Settings Area.</p>
      </footer>
    </div>
  );
}

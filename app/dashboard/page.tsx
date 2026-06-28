import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { decrypt } from '@/lib/crypto';
import DashboardGrid from './DashboardGrid';

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // 1. Fetch connected accounts
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id, ig_username, ig_user_id, encrypted_access_token')
    .order('created_at', { ascending: false });

  if (accountsError) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 text-center">
        <h1 className="text-xl font-bold text-red-400">Database Error</h1>
        <p className="text-slate-400 mt-2">{accountsError.message}</p>
      </div>
    );
  }

  // Handle empty state
  if (!accounts || accounts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              AutoDMX
            </span>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-24 flex-1 flex flex-col justify-center items-center text-center relative z-10">
          <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">No Connected Accounts</h2>
          <p className="text-sm text-slate-400 max-w-sm mt-2 mb-8 leading-relaxed">
            Please connect your Instagram Creator or Business account in settings to start automating comment responses.
          </p>
          <Link
            href="/dashboard/settings"
            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
          >
            Go to Settings
          </Link>
        </main>
      </div>
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 text-center">
        <h1 className="text-xl font-bold text-red-400">Decryption Error</h1>
        <p className="text-slate-400 mt-2">Failed to decrypt Instagram access token. Try reconnecting your account.</p>
        <Link href="/dashboard/settings" className="mt-6 text-sm text-violet-400 hover:underline">
          Go to Settings
        </Link>
      </div>
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
      `https://graph.facebook.com/v19.0/${activeAccount.ig_user_id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=24&access_token=${decryptedToken}`,
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
            <span className="text-sm font-medium text-slate-300">Dashboard</span>
            <span className="text-slate-700">|</span>
            <Link href="/dashboard/contacts" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
              Contacts
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/dashboard/analytics" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
              Analytics
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/dashboard/settings" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
              Settings
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" title="System Status: Online" />
            <span className="text-xs text-slate-400">System Online</span>
          </div>
        </div>
      </header>

      {/* Dashboard Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Select a post or reel to set up automated private comment replies.</p>
        </div>

        {/* API Error Warning */}
        {apiError && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-sm flex items-start gap-3 max-w-4xl">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-bold">Failed to sync with Instagram</h4>
              <p className="text-xs text-slate-400 mt-1">{apiError}</p>
              <Link href="/dashboard/settings" className="mt-3 inline-block text-xs font-semibold text-violet-400 hover:underline">
                Update credentials in Settings &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Media Grid Component */}
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 mt-20">
        <p>© {new Date().getFullYear()} AutoDMX. Dashboard Area.</p>

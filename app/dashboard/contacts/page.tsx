import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import ContactsTable from './ContactsTable';

type Contact = {
  id: string;
  account_id: string;
  igsid: string;
  username: string;
  profile_pic_url: string | null;
  follows_business: boolean | null;
  email: string | null;
  phone: string | null;
  tags: string[];
  created_at: string;
  last_interaction_at: string;
};

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: { accountId?: string };
}) {
  const supabase = createClient();


  // 1. Fetch connected accounts
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id, ig_username, ig_user_id')
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">No Connected Accounts</h2>
          <p className="text-sm text-slate-400 max-w-sm mt-2 mb-8 leading-relaxed">
            Please connect your Instagram Creator or Business account in settings to start viewing contacts.
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

  // 3. Fetch contacts for active account
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('*')
    .eq('account_id', activeAccount.id)
    .order('last_interaction_at', { ascending: false });

  if (contactsError) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 text-center">
        <h1 className="text-xl font-bold text-red-400">Database Error</h1>
        <p className="text-slate-400 mt-2">{contactsError.message}</p>
      </div>
    );
  }

  const typedContacts: Contact[] = contacts || [];

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

      {/* Contacts Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Contacts</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and export leads generated from comment automations.</p>
        </div>

        {/* Contacts Table Client Component */}
        <ContactsTable
          contacts={typedContacts}
          accountId={activeAccount.id}
          accounts={accounts.map((a) => ({
            id: a.id,
            ig_username: a.ig_username,
            ig_user_id: a.ig_user_id,
          }))}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 mt-20">
        <p>© {new Date().getFullYear()} AutoDMX. Contacts Directory.</p>
      </footer>
    </div>
  );
}

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import ContactsTable from './ContactsTable';
import { AppShell } from '../../_components/AppShell';

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
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold text-red-400">Database error</h1>
        <p className="mt-2 text-sm text-slate-400">{accountsError.message}</p>
      </div>
    );
  }

  // Handle empty state
  if (!accounts || accounts.length === 0) {
    return (
      <AppShell variant="dashboard" activeNav="contacts">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center sm:px-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
            <svg
              className="h-7 w-7 text-brand-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            No connected accounts
          </h2>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            Connect your Instagram Creator or Business account in settings to
            start collecting contacts.
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
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold text-red-400">Database error</h1>
        <p className="mt-2 text-sm text-slate-400">{contactsError.message}</p>
      </div>
    );
  }

  const typedContacts: Contact[] = contacts || [];

  return (
    <AppShell variant="dashboard" activeNav="contacts">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">
              Lead capture
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
              Contacts
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Every person who interacted with one of your automations.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Synced from Supabase in real time
          </div>
        </div>

        <ContactsTable
          contacts={typedContacts}
          accountId={activeAccount.id}
          accounts={accounts.map((a) => ({
            id: a.id,
            ig_username: a.ig_username,
            ig_user_id: a.ig_user_id,
          }))}
        />
      </div>
    </AppShell>
  );
}

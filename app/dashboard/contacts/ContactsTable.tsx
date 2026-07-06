'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateContactTags } from './actions';

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

type Account = {
  id: string;
  ig_username: string;
  ig_user_id: string;
};

type Props = {
  contacts: Contact[];
  accountId: string;
  accounts: Account[];
};

export default function ContactsTable({ contacts, accountId, accounts }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Tag input states mapped by contact ID
  const [tagInputs, setTagInputs] = useState<{ [contactId: string]: string }>({});
  const [showTagInputs, setShowTagInputs] = useState<{ [contactId: string]: boolean }>({});

  const [isUpdating, setIsUpdating] = useState<{ [contactId: string]: boolean }>({});

  const activeAccount = accounts.find((a) => a.id === accountId) || accounts[0];

  const handleAccountChange = (id: string) => {
    router.push(`/dashboard/contacts?accountId=${id}`);
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.username.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      c.tags.some((t) => t.toLowerCase().includes(term))
    );
  });

  // Add a tag to a contact
  const handleAddTag = async (contactId: string, currentTags: string[]) => {
    const tagText = tagInputs[contactId]?.trim();
    if (!tagText) return;

    // Avoid duplicates
    if (currentTags.includes(tagText)) {
      setTagInputs({ ...tagInputs, [contactId]: '' });
      setShowTagInputs({ ...showTagInputs, [contactId]: false });
      return;
    }

    const updatedTags = [...currentTags, tagText];
    setIsUpdating({ ...isUpdating, [contactId]: true });

    try {
      await updateContactTags(contactId, updatedTags);
      setTagInputs({ ...tagInputs, [contactId]: '' });
      setShowTagInputs({ ...showTagInputs, [contactId]: false });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add tag');
    } finally {
      setIsUpdating({ ...isUpdating, [contactId]: false });
    }
  };

  // Remove a tag from a contact
  const handleRemoveTag = async (
    contactId: string,
    currentTags: string[],
    tagToRemove: string
  ) => {
    const updatedTags = currentTags.filter((t) => t !== tagToRemove);
    setIsUpdating({ ...isUpdating, [contactId]: true });

    try {
      await updateContactTags(contactId, updatedTags);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove tag');
    } finally {
      setIsUpdating({ ...isUpdating, [contactId]: false });
    }
  };

  // Export filtered contacts to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'IGSID',
      'Username',
      'Follows Business',
      'Email',
      'Phone',
      'Tags',
      'Last Interaction',
    ];

    const rows = filteredContacts.map((c) => [
      c.id,
      c.igsid,
      c.username,
      c.follows_business === null ? 'Unknown' : c.follows_business ? 'Yes' : 'No',
      c.email || '',
      c.phone || '',
      c.tags.join('; '),
      new Date(c.last_interaction_at).toISOString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((r) =>
          r.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `leads_${activeAccount.ig_username}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Controls: Switcher, Search, Export */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
          <div className="relative w-full sm:w-auto">
            <select
              value={accountId}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/8 bg-ink-900/60 px-4 py-2.5 pr-10 text-sm font-medium text-slate-100 outline-none transition-all focus:border-brand-400/50 focus:ring-2 focus:ring-brand-400/20 sm:min-w-[200px]"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  @{a.ig_username}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search username, email, tag…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/8 bg-ink-900/60 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-brand-400/50 focus:ring-2 focus:ring-brand-400/20"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredContacts.length === 0}
          className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="m7 10 5 5 5-5" />
            <path d="M12 15V3" />
          </svg>
          Export CSV ({filteredContacts.length})
        </button>
      </div>

      {/* Leads Table Container */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
        {filteredContacts.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-slate-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            No contacts match the active filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">IGSID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4">Last interaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                {filteredContacts.map((c) => {
                  const hasTagInput = showTagInputs[c.id] ?? false;
                  const tagInputValue = tagInputs[c.id] ?? '';
                  const loading = isUpdating[c.id] ?? false;

                  return (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-gradient-to-br from-brand-500/30 to-accent-500/30 text-xs font-semibold text-white">
                            {c.username.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-white">
                            @{c.username}
                          </span>
                        </div>
                      </td>

                      {/* IGSID */}
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {c.igsid}
                      </td>

                      {/* Follow status */}
                      <td className="px-6 py-4">
                        {c.follows_business === null ? (
                          <span className="inline-block rounded-md border border-white/8 bg-ink-900 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                            Not checked
                          </span>
                        ) : c.follows_business ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Following
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            Not following
                          </span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        {c.email ? (
                          <span className="text-slate-100">{c.email}</span>
                        ) : (
                          <span className="italic text-slate-500">
                            None collected
                          </span>
                        )}
                      </td>

                      {/* Tags */}
                      <td className="px-6 py-4">
                        <div className="flex max-w-xs flex-wrap items-center gap-1.5">
                          {c.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-ink-900 px-2 py-0.5 text-[10px] font-medium text-slate-200"
                            >
                              {tag}
                              <button
                                onClick={() =>
                                  handleRemoveTag(c.id, c.tags, tag)
                                }
                                disabled={loading}
                                className="text-slate-500 transition-colors hover:text-white"
                                aria-label={`Remove tag ${tag}`}
                              >
                                <svg
                                  className="h-3 w-3"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </button>
                            </span>
                          ))}

                          {/* Tag Input Form Toggle */}
                          {hasTagInput ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleAddTag(c.id, c.tags);
                              }}
                              className="flex items-center"
                            >
                              <input
                                type="text"
                                size={10}
                                autoFocus
                                disabled={loading}
                                placeholder="New tag"
                                value={tagInputValue}
                                onChange={(e) =>
                                  setTagInputs({
                                    ...tagInputs,
                                    [c.id]: e.target.value,
                                  })
                                }
                                onBlur={() => {
                                  setTimeout(() => {
                                    setShowTagInputs({
                                      ...showTagInputs,
                                      [c.id]: false,
                                    });
                                  }, 200);
                                }}
                                className="rounded-md border border-white/8 bg-ink-900 px-1.5 py-0.5 text-xs text-slate-100 outline-none focus:border-brand-400/50"
                              />
                            </form>
                          ) : (
                            <button
                              onClick={() =>
                                setShowTagInputs({
                                  ...showTagInputs,
                                  [c.id]: true,
                                })
                              }
                              disabled={loading}
                              className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/8 bg-ink-900 text-xs text-slate-400 transition-colors hover:border-white/15 hover:text-white"
                              aria-label="Add tag"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Last Interaction */}
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(c.last_interaction_at).toLocaleString(
                          undefined,
                          {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

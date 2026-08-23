'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateContactTags } from './actions';
import { Search, ChevronDown, Download, Users, X, Plus } from 'lucide-react';

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
      <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
          <div className="relative w-full sm:w-auto">
            <select
              value={accountId}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 pr-9 text-sm font-medium text-neutral-900 outline-none transition-all focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 sm:min-w-[200px] dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  @{a.ig_username}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search username, email, tag…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-4 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:placeholder-neutral-500 dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredContacts.length === 0}
          className="btn-secondary px-4 py-2 text-xs font-medium disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV ({filteredContacts.length})
        </button>
      </div>

      {/* Leads Table Container */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
        {filteredContacts.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">
            <Users className="mx-auto mb-3 h-10 w-10 text-neutral-400 dark:text-neutral-600" />
            No contacts match the active filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/80 text-[10px] font-mono font-medium tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-400">
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">IGSID</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Tags</th>
                  <th className="px-6 py-3.5">Last interaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/70 text-sm dark:divide-neutral-800">
                {filteredContacts.map((c) => {
                  const hasTagInput = showTagInputs[c.id] ?? false;
                  const tagInputValue = tagInputs[c.id] ?? '';
                  const loading = isUpdating[c.id] ?? false;

                  return (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40"
                    >
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 font-mono text-[11px] font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                            {c.username.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            @{c.username}
                          </span>
                        </div>
                      </td>

                      {/* IGSID */}
                      <td className="px-6 py-4 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                        {c.igsid}
                      </td>

                      {/* Follow status */}
                      <td className="px-6 py-4">
                        {c.follows_business === null ? (
                          <span className="inline-block rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
                            Not checked
                          </span>
                        ) : c.follows_business ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Following
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                            Not following
                          </span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-xs">
                        {c.email ? (
                          <span className="font-mono text-neutral-900 dark:text-white">{c.email}</span>
                        ) : (
                          <span className="text-neutral-400">
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
                              className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                            >
                              {tag}
                              <button
                                onClick={() =>
                                  handleRemoveTag(c.id, c.tags, tag)
                                }
                                disabled={loading}
                                className="text-neutral-400 transition-colors hover:text-black dark:hover:text-white"
                                aria-label={`Remove tag ${tag}`}
                              >
                                <X className="h-2.5 w-2.5" />
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
                                className="rounded-md border border-neutral-300 bg-white px-1.5 py-0.5 text-xs text-neutral-900 outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
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
                              className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 text-xs text-neutral-500 transition-colors hover:border-neutral-400 hover:text-black dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white"
                              aria-label="Add tag"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Last Interaction */}
                      <td className="px-6 py-4 text-xs text-neutral-500 dark:text-neutral-400">
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

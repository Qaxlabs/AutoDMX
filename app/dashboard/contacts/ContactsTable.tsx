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
  const handleRemoveTag = async (contactId: string, currentTags: string[], tagToRemove: string) => {
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
      [headers.join(','), ...rows.map((r) => r.map((val) => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_${activeAccount.ig_username}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Controls: Switcher, Search, Export */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/30 border border-slate-900 p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
          {/* Account Dropdown */}
          <div className="relative">
            <select
              value={accountId}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="appearance-none bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 focus:border-violet-500/50 outline-none text-sm cursor-pointer font-semibold"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  @{a.ig_username}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by username, email, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-violet-500/50 placeholder-slate-600"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExportCSV}
          disabled={filteredContacts.length === 0}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(139,92,246,0.15)]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV ({filteredContacts.length})
        </button>
      </div>

      {/* Leads Table Container */}
      <div className="border border-slate-900 bg-slate-900/10 rounded-2xl overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm">
            <svg className="w-12 h-12 text-slate-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            No contacts match the active filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-900/20 text-[10px] font-bold tracking-widest uppercase text-slate-400">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">IGSID</th>
                  <th className="px-6 py-4">Follows Profile</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4">Last Interaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50 text-sm text-slate-300">
                {filteredContacts.map((c) => {
                  const hasTagInput = showTagInputs[c.id] ?? false;
                  const tagInputValue = tagInputs[c.id] ?? '';
                  const loading = isUpdating[c.id] ?? false;

                  return (
                    <tr key={c.id} className="hover:bg-slate-900/10 transition-colors">
                      {/* User Info */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-950 border border-violet-900 flex items-center justify-center font-bold text-violet-400 text-xs select-none">
                          {c.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-100 block">@{c.username}</span>
                        </div>
                      </td>

                      {/* IGSID */}
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono">{c.igsid}</td>

                      {/* Follow status */}
                      <td className="px-6 py-4">
                        {c.follows_business === null ? (
                          <span className="inline-block text-[10px] font-semibold bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                            Not Checked
                          </span>
                        ) : c.follows_business ? (
                          <span className="inline-block text-[10px] font-semibold bg-green-950/20 text-green-400 px-2 py-0.5 rounded border border-green-900/30">
                            Following
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-semibold bg-red-950/20 text-red-400 px-2 py-0.5 rounded border border-red-900/30">
                            Not Following
                          </span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        {c.email ? (
                          <span className="text-slate-200">{c.email}</span>
                        ) : (
                          <span className="text-slate-600 italic">None collected</span>
                        )}
                      </td>

                      {/* Tags */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                          {c.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded"
                            >
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(c.id, c.tags, tag)}
                                disabled={loading}
                                className="text-slate-500 hover:text-slate-300 cursor-pointer"
                              >
                                &times;
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
                                  setTagInputs({ ...tagInputs, [c.id]: e.target.value })
                                }
                                onBlur={() => {
                                  // Timeout to let submission happen before blur removes it
                                  setTimeout(() => {
                                    setShowTagInputs({ ...showTagInputs, [c.id]: false });
                                  }, 200);
                                }}
                                className="bg-slate-950 text-xs border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 outline-none focus:border-violet-500/50"
                              />
                            </form>
                          ) : (
                            <button
                              onClick={() => setShowTagInputs({ ...showTagInputs, [c.id]: true })}
                              disabled={loading}
                              className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-400 text-xs transition-colors"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Last Interaction */}
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(c.last_interaction_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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

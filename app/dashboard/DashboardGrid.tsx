'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AutomationSlideOver from './AutomationSlideOver';

type Post = {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

type Automation = {
  id?: string;
  name: string;
  trigger_type: string;
  media_scope: string;
  media_id: string | null;
  keywords: string[];
  public_reply_variants: string[];
  opening_dm: string;
  requires_follow: boolean;
  email_capture: boolean;
  is_active: boolean;
};

type Account = {
  id: string;
  ig_username: string;
  ig_user_id: string;
};

type Props = {
  media: Post[];
  automations: Automation[];
  accountId: string;
  accounts: Account[];
};

export default function DashboardGrid({ media, automations, accountId, accounts }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Slide-over State
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  // Switch account by updating the URL query param
  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAccountId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('accountId', newAccountId);
    
    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  };

  // Find automation for a post
  const getPostAutomation = (postId: string) => {
    return automations.find((a) => a.media_id === postId) || null;
  };

  // Filter media based on search and selected type
  const filteredMedia = media.filter((post) => {
    const matchesSearch = post.caption?.toLowerCase().includes(search.toLowerCase()) ?? true;
    
    if (filterType === 'ALL') return matchesSearch;
    if (filterType === 'REEL') {
      return matchesSearch && post.media_type === 'VIDEO';
    }
    if (filterType === 'IMAGE') {
      return matchesSearch && post.media_type === 'IMAGE';
    }
    if (filterType === 'CAROUSEL') {
      return matchesSearch && post.media_type === 'CAROUSEL_ALBUM';
    }
    return matchesSearch;
  });

  const handleCardClick = (post: Post) => {
    setSelectedPost(post);
    setIsSlideOverOpen(true);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  // Helper to get first line of caption
  const getFirstLine = (caption?: string) => {
    if (!caption) return 'No caption';
    return caption.split('\n')[0];
  };

  // Helper to format date
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Filters & Account Selector Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 rounded-2xl border border-slate-900 bg-slate-900/10 backdrop-blur-sm">
        {/* Account Selector */}
        <div className="w-full md:w-auto flex items-center gap-3">
          <label htmlFor="accountSelect" className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Active Account:
          </label>
          <select
            id="accountSelect"
            value={accountId}
            onChange={handleAccountChange}
            disabled={isPending}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:border-violet-500/50 outline-none text-sm cursor-pointer min-w-[200px]"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                @{acc.ig_username}
              </option>
            ))}
          </select>
        </div>

        {/* Search & Media Filter */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center flex-1 max-w-2xl justify-end">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 outline-none text-sm"
            />
            <svg className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-900 w-full sm:w-auto">
            {['ALL', 'IMAGE', 'REEL', 'CAROUSEL'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  filterType === type
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-900 rounded-3xl text-slate-500">
          No posts or reels found matching filters.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map((post) => {
            const auto = getPostAutomation(post.id);
            const isAutoActive = auto?.is_active ?? false;

            return (
              <div
                key={post.id}
                onClick={() => handleCardClick(post)}
                className="group relative rounded-2xl border border-slate-900 bg-slate-900/20 overflow-hidden cursor-pointer hover:border-slate-850 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="aspect-square w-full relative overflow-hidden bg-slate-950 border-b border-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.thumbnail_url || post.media_url}
                    alt={post.caption || 'Instagram Post'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-slate-950/80 backdrop-blur-sm text-slate-300 border border-slate-800">
                      {post.media_type === 'VIDEO' ? 'Reel' : post.media_type === 'CAROUSEL_ALBUM' ? 'Carousel' : 'Image'}
                    </span>
                  </div>

                  {auto && (
                    <div className="absolute top-3 right-3">
                      <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isAutoActive 
                          ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                          : 'bg-slate-500/10 border-slate-500/30 text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAutoActive ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`} />
                        {isAutoActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-slate-950/70 backdrop-blur-sm text-[10px] font-medium text-slate-400">
                    {formatDate(post.timestamp)}
                  </div>
                </div>

                <div className="p-5 space-y-1.5">
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-slate-100 transition-colors line-clamp-1 leading-snug">
                    {getFirstLine(post.caption)}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {post.caption ? post.caption.split('\n').slice(1).join(' ') : 'Click to configure automation...'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AutomationSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        post={selectedPost}
        accountId={accountId}
        existingAutomation={selectedPost ? getPostAutomation(selectedPost.id) : null}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

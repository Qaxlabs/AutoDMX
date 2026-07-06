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
  message?: string | null;
  links?: string[] | null;
  requires_follow: boolean;
  follow_prompt_message?: string | null;
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

const MEDIA_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'IMAGE', label: 'Images' },
  { key: 'REEL', label: 'Reels' },
  { key: 'CAROUSEL', label: 'Carousels' },
] as const;

export default function DashboardGrid({
  media,
  automations,
  accountId,
  accounts,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] =
    useState<(typeof MEDIA_FILTERS)[number]['key']>('ALL');

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
    const matchesSearch =
      post.caption?.toLowerCase().includes(search.toLowerCase()) ?? true;

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
    if (!caption) return 'Untitled post';
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

  const totalActive = automations.filter((a) => a.is_active).length;
  const totalInactive = automations.length - totalActive;

  return (
    <div className="space-y-8">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryStat label="Total posts" value={media.length} />
        <SummaryStat
          label="Active automations"
          value={totalActive}
          tone="good"
        />
        <SummaryStat
          label="Paused automations"
          value={totalInactive}
          tone={totalInactive > 0 ? 'warn' : 'muted'}
        />
        <SummaryStat label="Connected accounts" value={accounts.length} />
      </div>

      {/* Filters & Account Selector Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <label
            htmlFor="accountSelect"
            className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            Account
          </label>
          <div className="relative w-full md:w-auto">
            <select
              id="accountSelect"
              value={accountId}
              onChange={handleAccountChange}
              disabled={isPending}
              className="w-full appearance-none rounded-xl border border-white/8 bg-ink-900/60 px-4 py-2.5 pr-10 text-sm font-medium text-slate-100 outline-none transition-all focus:border-brand-400/50 focus:ring-2 focus:ring-brand-400/20 disabled:opacity-50 md:min-w-[200px]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  @{acc.ig_username}
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
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search posts by caption…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/8 bg-ink-900/60 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-brand-400/50 focus:ring-2 focus:ring-brand-400/20"
            />
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-slate-500"
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

          <div className="flex gap-1 rounded-xl border border-white/5 bg-ink-900/40 p-1">
            {MEDIA_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterType === f.key
                    ? 'bg-brand-500 text-white shadow-[0_0_20px_-5px_rgba(124,58,237,0.6)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/8 bg-white/[0.015] py-20 text-center text-sm text-slate-500">
          No posts or reels match the current filters.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMedia.map((post) => {
            const auto = getPostAutomation(post.id);
            const isAutoActive = auto?.is_active ?? false;
            const mediaType =
              post.media_type === 'VIDEO'
                ? 'Reel'
                : post.media_type === 'CAROUSEL_ALBUM'
                  ? 'Carousel'
                  : 'Image';

            return (
              <button
                key={post.id}
                onClick={() => handleCardClick(post)}
                className="card-lift group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] text-left"
              >
                <div className="relative aspect-square w-full overflow-hidden border-b border-white/5 bg-ink-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.thumbnail_url || post.media_url}
                    alt={post.caption || 'Instagram post'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />

                  <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                    <span className="rounded-full border border-white/10 bg-ink-950/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-200 backdrop-blur-sm">
                      {mediaType}
                    </span>
                  </div>

                  {auto && (
                    <div className="absolute right-3 top-3">
                      <span
                        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${
                          isAutoActive
                            ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                            : 'border-white/8 bg-ink-950/80 text-slate-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isAutoActive
                              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                              : 'bg-slate-500'
                          }`}
                        />
                        {isAutoActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 rounded-md bg-ink-950/80 px-2 py-0.5 text-[10px] font-medium text-slate-300 backdrop-blur-sm">
                    {formatDate(post.timestamp)}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <p className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-brand-200">
                    {getFirstLine(post.caption)}
                  </p>
                  <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">
                    {post.caption
                      ? post.caption.split('\n').slice(1).join(' ')
                      : 'Click to configure an automation for this post.'}
                  </p>
                </div>
              </button>
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

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'good' | 'warn' | 'muted';
}) {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-300'
      : tone === 'warn'
        ? 'text-amber-300'
        : 'text-white';
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

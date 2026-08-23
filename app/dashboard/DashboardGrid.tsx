'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AutomationSlideOver from './AutomationSlideOver';
import { Search, ChevronDown, Film, Image as ImageIcon, Layers } from 'lucide-react';

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
          tone={totalInactive > 0 ? 'muted' : 'muted'}
        />
        <SummaryStat label="Connected accounts" value={accounts.length} />
      </div>

      {/* Filters & Account Selector Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <label
            htmlFor="accountSelect"
            className="shrink-0 text-[11px] font-mono font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400"
          >
            Account
          </label>
          <div className="relative w-full md:w-auto">
            <select
              id="accountSelect"
              value={accountId}
              onChange={handleAccountChange}
              disabled={isPending}
              className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 pr-9 text-sm font-medium text-neutral-900 outline-none transition-all focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-50 md:min-w-[200px] dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  @{acc.ig_username}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <ChevronDown className="h-4 w-4" />
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
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-4 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:placeholder-neutral-500 dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          </div>

          <div className="flex gap-1 rounded-xl border border-neutral-200 bg-neutral-100/70 p-1 dark:border-neutral-800 dark:bg-neutral-950">
            {MEDIA_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  filterType === f.key
                    ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
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
        <div className="rounded-3xl border border-dashed border-neutral-200 py-20 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
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

            const MediaIcon =
              post.media_type === 'VIDEO'
                ? Film
                : post.media_type === 'CAROUSEL_ALBUM'
                  ? Layers
                  : ImageIcon;

            return (
              <button
                key={post.id}
                onClick={() => handleCardClick(post)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-700 dark:hover:shadow-xl"
              >
                <div className="relative aspect-square w-full overflow-hidden border-b border-neutral-200/80 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.thumbnail_url || post.media_url}
                    alt={post.caption || 'Instagram post'}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/90 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-neutral-800 backdrop-blur-md dark:border-white/10 dark:bg-black/90 dark:text-neutral-200">
                      <MediaIcon className="h-3 w-3" />
                      {mediaType}
                    </span>
                  </div>

                  {auto && (
                    <div className="absolute right-3 top-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium backdrop-blur-md ${
                          isAutoActive
                            ? 'border-emerald-500/20 bg-emerald-50/90 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/90 dark:text-emerald-400'
                            : 'border-neutral-200 bg-white/90 text-neutral-600 dark:border-neutral-800 dark:bg-black/90 dark:text-neutral-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isAutoActive ? 'bg-emerald-500' : 'bg-neutral-400'
                          }`}
                        />
                        {isAutoActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                    {formatDate(post.timestamp)}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-1 p-4">
                  <p className="line-clamp-1 text-sm font-semibold text-neutral-900 transition-colors group-hover:text-black dark:text-neutral-100 dark:group-hover:text-white">
                    {getFirstLine(post.caption)}
                  </p>
                  <p className="line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {post.caption
                      ? post.caption.split('\n').slice(1).join(' ')
                      : 'Click to configure an automation rule.'}
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
      ? 'text-emerald-700 dark:text-emerald-400'
      : 'text-neutral-900 dark:text-white';

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="text-[11px] font-mono font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { savePostAutomation } from './actions';
import { X, ChevronDown, AlertCircle } from 'lucide-react';

type Post = {
  id: string;
  caption?: string;
  media_url: string;
  thumbnail_url?: string;
  media_type: string;
  permalink: string;
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  accountId: string;
  existingAutomation: Automation | null;
  onSuccess: () => void;
};

export default function AutomationSlideOver({
  isOpen,
  onClose,
  post,
  accountId,
  existingAutomation,
  onSuccess,
}: Props) {
  const [name, setName] = useState('');

  // 1. Keywords
  const [matchAnyComment, setMatchAnyComment] = useState(false);
  const [keywords, setKeywords] = useState('');

  // 2. Public Replies (up to 3)
  const [publicReply1, setPublicReply1] = useState('');
  const [publicReply2, setPublicReply2] = useState('');
  const [publicReply3, setPublicReply3] = useState('');

  // 3. Message & Links (up to 3)
  const [message, setMessage] = useState('');
  const [link1, setLink1] = useState('');
  const [link2, setLink2] = useState('');
  const [link3, setLink3] = useState('');

  // 4. Require follow gate
  const [requiresFollow, setRequiresFollow] = useState(false);
  const [followPromptMessage, setFollowPromptMessage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Status and loading states
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill form when post or existingAutomation changes
  useEffect(() => {
    if (!post) return;

    if (existingAutomation) {
      setName(existingAutomation.name);

      const hasKeywords = existingAutomation.keywords && existingAutomation.keywords.length > 0;
      setMatchAnyComment(!hasKeywords);
      setKeywords(hasKeywords ? existingAutomation.keywords.join(', ') : '');

      setPublicReply1(existingAutomation.public_reply_variants?.[0] || '');
      setPublicReply2(existingAutomation.public_reply_variants?.[1] || '');
      setPublicReply3(existingAutomation.public_reply_variants?.[2] || '');

      setMessage(existingAutomation.message || '');
      setLink1(existingAutomation.links?.[0] || '');
      setLink2(existingAutomation.links?.[1] || '');
      setLink3(existingAutomation.links?.[2] || '');

      setRequiresFollow(existingAutomation.requires_follow ?? false);
      setFollowPromptMessage(existingAutomation.follow_prompt_message || '');
      setIsActive(existingAutomation.is_active);
    } else {
      const firstLine = post.caption ? post.caption.split('\n')[0] : '';
      setName(`Comment Automation: ${firstLine.substring(0, 40) || post.id}`);
      setMatchAnyComment(false);
      setKeywords('');

      setPublicReply1('Thanks! Check your DMs 📩');
      setPublicReply2('Sent you a DM! Let me know if you got it.');
      setPublicReply3('');

      setMessage('Hey! Thanks for commenting. Here is the link you requested: [link]');
      setLink1('');
      setLink2('');
      setLink3('');

      setRequiresFollow(false);
      setFollowPromptMessage('Please follow our profile first to get the link!');
      setIsActive(true);
    }
    setError(null);
  }, [post, existingAutomation]);

  if (!post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const parsedKeywords = matchAnyComment
      ? []
      : keywords
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k !== '');

    const parsedPublicReplies = [publicReply1, publicReply2, publicReply3]
      .map((r) => r.trim())
      .filter((r) => r !== '');

    const parsedLinks = [link1, link2, link3]
      .map((l) => l.trim())
      .filter((l) => l !== '');

    try {
      await savePostAutomation({
        accountId,
        name,
        triggerType: 'comment',
        mediaScope: 'specific',
        mediaId: post.id,
        keywords: parsedKeywords,
        publicReplyVariants: parsedPublicReplies,
        message,
        links: parsedLinks,
        requiresFollow,
        followPromptMessage: requiresFollow ? followPromptMessage : null,
        isActive,
      });
      onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to save automation');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg transform overflow-y-auto border-l border-neutral-200/90 bg-white/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out dark:border-neutral-800 dark:bg-[#121214]/95 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Configure automation"
      >
        <div className="space-y-6 p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-neutral-200/80 pb-5 dark:border-neutral-800">
            <div>
              <p className="text-[11px] font-mono font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                Automation
              </p>
              <h2 className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
                {existingAutomation ? 'Edit automation' : 'New automation'}
              </h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Define reply rules for comments on this post.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/60 p-3.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Post Preview Card */}
          <div className="flex items-start gap-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.thumbnail_url || post.media_url}
              alt="Post thumbnail"
              className="h-14 w-14 rounded-lg border border-neutral-200/80 object-cover dark:border-neutral-800"
            />
            <div className="min-w-0 flex-1">
              <span className="mb-1 inline-block rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-medium tracking-wide text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
                {post.media_type}
              </span>
              <p className="line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                {post.caption || 'No caption'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Automation name" id="autoName">
              <input
                id="autoName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="apple-input"
              />
            </Field>

            {/* 1. Keywords */}
            <Section
              title="Trigger keywords"
              hint="Comma-separate to match any of these words. Leave empty to match all comments."
              right={
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={matchAnyComment}
                    onChange={(e) => setMatchAnyComment(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">Match any</span>
                </label>
              }
            >
              <input
                type="text"
                disabled={matchAnyComment}
                placeholder="e.g. INFO, GUIDE, PROMO"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className={`apple-input ${matchAnyComment ? 'cursor-not-allowed opacity-50' : ''}`}
              />
            </Section>

            {/* 2. Public Reply Variants */}
            <Section
              title="Public reply variants"
              hint="These rotate randomly so replies feel natural."
            >
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Variant 1 (required)"
                  value={publicReply1}
                  onChange={(e) => setPublicReply1(e.target.value)}
                  className="apple-input"
                />
                <input
                  type="text"
                  placeholder="Variant 2 (optional)"
                  value={publicReply2}
                  onChange={(e) => setPublicReply2(e.target.value)}
                  className="apple-input"
                />
                <input
                  type="text"
                  placeholder="Variant 3 (optional)"
                  value={publicReply3}
                  onChange={(e) => setPublicReply3(e.target.value)}
                  className="apple-input"
                />
              </div>
            </Section>

            {/* 3. Message */}
            <Section
              title="DM message"
              hint="Sent as a private DM the moment the comment is detected."
            >
              <textarea
                id="messageInput"
                required
                rows={4}
                placeholder="Write your automated message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="apple-input resize-none"
              />
            </Section>

            {/* 4. Links (max 3) */}
            <Section title="Links" hint="Up to 3 links. Tracked separately in analytics.">
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://… (Link 1)"
                  value={link1}
                  onChange={(e) => setLink1(e.target.value)}
                  className="apple-input"
                />
                <input
                  type="url"
                  placeholder="https://… (Link 2)"
                  value={link2}
                  onChange={(e) => setLink2(e.target.value)}
                  className="apple-input"
                />
                <input
                  type="url"
                  placeholder="https://… (Link 3)"
                  value={link3}
                  onChange={(e) => setLink3(e.target.value)}
                  className="apple-input"
                />
              </div>
            </Section>

            {/* Collapsible Advanced Section */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[11px] font-mono font-medium tracking-wider text-neutral-600 uppercase transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
              >
                <span>Advanced · Follow gate</span>
                <ChevronDown
                  className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                    showAdvanced ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showAdvanced && (
                <div className="space-y-4 border-t border-neutral-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={requiresFollow}
                      onChange={(e) => setRequiresFollow(e.target.checked)}
                      className="mt-1 h-4 w-4 cursor-pointer rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
                    />
                    <div>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        Require a follow before sending
                      </span>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        Verifies the user follows the connected account before
                        delivering the message.
                      </p>
                    </div>
                  </label>

                  {requiresFollow && (
                    <Field
                      label="Follow prompt message"
                      id="followPrompt"
                    >
                      <input
                        id="followPrompt"
                        type="text"
                        required
                        placeholder="Please follow our profile first!"
                        value={followPromptMessage}
                        onChange={(e) => setFollowPromptMessage(e.target.value)}
                        className="apple-input"
                      />
                    </Field>
                  )}
                </div>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
              <div>
                <div className="text-sm font-semibold text-neutral-900 dark:text-white">Active status</div>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  When turned off, incoming comments on this post are ignored.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-neutral-300 transition-colors peer-checked:bg-neutral-900 dark:bg-neutral-700 dark:peer-checked:bg-white peer-focus:ring-2 peer-focus:ring-neutral-400 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white dark:after:bg-black after:transition-transform peer-checked:after:translate-x-5" />
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary flex-1 py-3 text-sm disabled:opacity-50"
              >
                {isSaving
                  ? 'Saving…'
                  : existingAutomation
                    ? 'Save changes'
                    : 'Enable automation'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-5 py-3 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </aside>
    </>
  );
}

function Section({
  title,
  hint,
  right,
  children,
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-mono font-medium tracking-wider text-neutral-600 uppercase dark:text-neutral-400">
          {title}
        </h3>
        {right}
      </div>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">{hint}</p>}
    </div>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[11px] font-mono font-medium tracking-wider text-neutral-600 uppercase dark:text-neutral-400"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { savePostAutomation } from './actions';

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
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Container */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg transform overflow-y-auto border-l border-white/5 bg-ink-950/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Configure automation"
      >
        <div className="space-y-7 p-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">
                Automation
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                {existingAutomation ? 'Edit automation' : 'New automation'}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Define reply rules for comments on this post.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
              aria-label="Close"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-300">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Post Preview Card */}
          <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.thumbnail_url || post.media_url}
              alt="Post thumbnail"
              className="h-16 w-16 rounded-lg border border-white/8 object-cover"
            />
            <div className="min-w-0 flex-1">
              <span className="mb-1 inline-block rounded-full border border-white/8 bg-ink-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-300">
                {post.media_type}
              </span>
              <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">
                {post.caption || 'No caption'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="Automation name" id="autoName">
              <input
                id="autoName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
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
                    className="h-4 w-4 cursor-pointer rounded border-white/15 bg-ink-900 text-brand-500 focus:ring-brand-400/30"
                  />
                  <span className="text-xs text-slate-400">Match any</span>
                </label>
              }
            >
              <input
                type="text"
                disabled={matchAnyComment}
                placeholder="e.g. INFO, GUIDE, PROMO"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className={`form-input ${matchAnyComment ? 'cursor-not-allowed opacity-50' : ''}`}
              />
            </Section>

            {/* 2. Public Reply Variants */}
            <Section
              title="Public reply variants"
              hint="These rotate randomly so replies feel natural."
            >
              <div className="space-y-2.5">
                <input
                  type="text"
                  required
                  placeholder="Variant 1 (required)"
                  value={publicReply1}
                  onChange={(e) => setPublicReply1(e.target.value)}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Variant 2 (optional)"
                  value={publicReply2}
                  onChange={(e) => setPublicReply2(e.target.value)}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Variant 3 (optional)"
                  value={publicReply3}
                  onChange={(e) => setPublicReply3(e.target.value)}
                  className="form-input"
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
                className="form-input resize-none"
              />
            </Section>

            {/* 4. Links (max 3) */}
            <Section title="Links" hint="Up to 3 links. Tracked separately in analytics.">
              <div className="space-y-2.5">
                <input
                  type="url"
                  placeholder="https://… (Link 1)"
                  value={link1}
                  onChange={(e) => setLink1(e.target.value)}
                  className="form-input"
                />
                <input
                  type="url"
                  placeholder="https://… (Link 2)"
                  value={link2}
                  onChange={(e) => setLink2(e.target.value)}
                  className="form-input"
                />
                <input
                  type="url"
                  placeholder="https://… (Link 3)"
                  value={link3}
                  onChange={(e) => setLink3(e.target.value)}
                  className="form-input"
                />
              </div>
            </Section>

            {/* Collapsible Advanced Section */}
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 transition-colors hover:bg-white/[0.02] hover:text-slate-200"
              >
                <span>Advanced · Follow gate</span>
                <svg
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    showAdvanced ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {showAdvanced && (
                <div className="space-y-4 border-t border-white/5 bg-ink-900/40 p-5">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={requiresFollow}
                      onChange={(e) => setRequiresFollow(e.target.checked)}
                      className="mt-1 h-4 w-4 cursor-pointer rounded border-white/15 bg-ink-900 text-brand-500 focus:ring-brand-400/30"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-100">
                        Require a follow before sending
                      </span>
                      <p className="mt-0.5 text-[11px] text-slate-400">
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
                        className="form-input"
                      />
                    </Field>
                  )}
                </div>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div>
                <div className="text-sm font-semibold text-white">Active</div>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  When off, comments on this post are ignored.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-white/10 transition-colors peer-checked:bg-brand-500 peer-focus:ring-2 peer-focus:ring-brand-400/30 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
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

      {/* Local utility classes for the form inputs */}
      <style jsx>{`
        :global(.form-input) {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(11, 11, 24, 0.6);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #e2e8f0;
          outline: none;
          transition: all 0.15s ease;
        }
        :global(.form-input::placeholder) {
          color: #475569;
        }
        :global(.form-input:focus) {
          border-color: rgba(182, 155, 255, 0.5);
          background: rgba(11, 11, 24, 0.9);
          box-shadow: 0 0 0 2px rgba(182, 155, 255, 0.15);
        }
      `}</style>
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
    <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
          {title}
        </h3>
        {right}
      </div>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-slate-500">{hint}</p>}
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
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

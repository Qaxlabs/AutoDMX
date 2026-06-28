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
  opening_dm: string;
  requires_follow: boolean;
  follow_up_message?: string | null;
  follow_up_delay_minutes?: number | null;
  final_message?: string | null;
  final_links?: string[] | null;
  email_capture: boolean;
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
  
  // 3. Opening DM
  const [openingDm, setOpeningDm] = useState('');
  
  // 4. Require follow toggle
  const [requiresFollow, setRequiresFollow] = useState(false);
  
  // 5. Follow-up
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [followUpDelayMinutes, setFollowUpDelayMinutes] = useState<number | ''>(5);
  
  // 6. Final Message & Links (up to 3)
  const [finalMessage, setFinalMessage] = useState('');
  const [finalLink1, setFinalLink1] = useState('');
  const [finalLink2, setFinalLink2] = useState('');
  const [finalLink3, setFinalLink3] = useState('');
  
  // 7. Collect email toggle
  const [emailCapture, setEmailCapture] = useState(false);
  
  // Status and loading states
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute if final step exists to conditionally render follow-up
  const hasFinalStep = 
    finalMessage.trim() !== '' || 
    finalLink1.trim() !== '' || 
    finalLink2.trim() !== '' || 
    finalLink3.trim() !== '';

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
      
      setOpeningDm(existingAutomation.opening_dm || '');
      setRequiresFollow(existingAutomation.requires_follow);
      
      setFollowUpMessage(existingAutomation.follow_up_message || '');
      setFollowUpDelayMinutes(existingAutomation.follow_up_delay_minutes ?? 5);
      
      setFinalMessage(existingAutomation.final_message || '');
      setFinalLink1(existingAutomation.final_links?.[0] || '');
      setFinalLink2(existingAutomation.final_links?.[1] || '');
      setFinalLink3(existingAutomation.final_links?.[2] || '');
      
      setEmailCapture(existingAutomation.email_capture);
      setIsActive(existingAutomation.is_active);
    } else {
      const firstLine = post.caption ? post.caption.split('\n')[0] : '';
      setName(`Comment Automation: ${firstLine.substring(0, 40) || post.id}`);
      setMatchAnyComment(false);
      setKeywords('');
      
      setPublicReply1('Thanks! Check your DMs 📩');
      setPublicReply2('Sent you a DM! Let me know if you got it.');
      setPublicReply3('');
      
      setOpeningDm('Hey! Thanks for commenting. Here is the link you requested: [link]');
      setRequiresFollow(false);
      
      setFollowUpMessage('');
      setFollowUpDelayMinutes(5);
      
      setFinalMessage('');
      setFinalLink1('');
      setFinalLink2('');
      setFinalLink3('');
      
      setEmailCapture(false);
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

    const parsedFinalLinks = [finalLink1, finalLink2, finalLink3]
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
        openingDm,
        requiresFollow,
        followUpMessage: hasFinalStep && followUpMessage ? followUpMessage : null,
        followUpDelayMinutes: hasFinalStep && typeof followUpDelayMinutes === 'number' ? followUpDelayMinutes : null,
        finalMessage: hasFinalStep && finalMessage ? finalMessage : null,
        finalLinks: hasFinalStep ? parsedFinalLinks : [],
        emailCapture,
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
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div
        className={`fixed inset-y-0 right-0 max-w-lg w-full bg-slate-950 border-l border-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-900">
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">
                {existingAutomation ? 'Edit Automation' : 'Configure Automation'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Define reply rules for comments on this post</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Post Preview Card */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-900 bg-slate-900/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.thumbnail_url || post.media_url}
              alt="Post thumbnail"
              className="w-16 h-16 object-cover rounded-lg border border-slate-850"
            />
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-slate-900 text-violet-400 border border-slate-800 px-2 py-0.5 rounded-full mb-1">
                {post.media_type}
              </span>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {post.caption || 'No caption'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="autoName" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Automation Name
              </label>
              <input
                id="autoName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all outline-none"
              />
            </div>

            {/* 1. Keywords */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Keywords
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={matchAnyComment}
                    onChange={(e) => setMatchAnyComment(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500/30 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400">Match any comment</span>
                </label>
              </div>

              <input
                type="text"
                disabled={matchAnyComment}
                placeholder="e.g. INFO, GUIDE, PROMO (comma-separated)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 outline-none transition-all focus:border-violet-500/50 ${
                  matchAnyComment ? 'opacity-40 cursor-not-allowed bg-slate-900' : ''
                }`}
              />
            </div>

            {/* 2. Public Reply Variants */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 space-y-4">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Public Reply Variants
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Variant 1 (required)"
                  value={publicReply1}
                  onChange={(e) => setPublicReply1(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 outline-none text-sm"
                />
                <input
                  type="text"
                  placeholder="Variant 2 (optional)"
                  value={publicReply2}
                  onChange={(e) => setPublicReply2(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 outline-none text-sm"
                />
                <input
                  type="text"
                  placeholder="Variant 3 (optional)"
                  value={publicReply3}
                  onChange={(e) => setPublicReply3(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 outline-none text-sm"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">
                these rotate randomly so replies don&apos;t look identical
              </span>
            </div>

            {/* 3. Opening DM */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 space-y-4">
              <label htmlFor="openingDmInput" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Opening DM
              </label>
              <textarea
                id="openingDmInput"
                required
                rows={3}
                placeholder="Compose the initial DM greeting..."
                value={openingDm}
                onChange={(e) => setOpeningDm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 outline-none resize-none text-sm"
              />
              <span className="text-[10px] text-slate-500 block">
                this can only contain one button OR one image, not both, per Instagram&apos;s rules
              </span>
            </div>

            {/* 4. Require Follow Toggle */}
            <div className="p-4 rounded-2xl border border-slate-900 bg-slate-900/10">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={requiresFollow}
                  onChange={(e) => setRequiresFollow(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500/30 w-4.5 h-4.5 cursor-pointer"
                />
                <div className="text-sm">
                  <span className="font-semibold text-slate-200 group-hover:text-slate-100 transition-colors">
                    Require a follow before sending the link
                  </span>
                  <p className="text-[11px] text-slate-400">Verifies follow status before trigger delivery</p>
                </div>
              </label>
            </div>

            {/* 5. Follow-up Message + Delay (Conditional) */}
            {hasFinalStep && (
              <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 space-y-4 border-l-2 border-l-violet-500">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="delayMinutes" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Follow-Up Delay
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="delayMinutes"
                      type="number"
                      min={1}
                      required
                      value={followUpDelayMinutes}
                      onChange={(e) => setFollowUpDelayMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded border border-slate-800 bg-slate-950 text-slate-200 text-sm text-center outline-none focus:border-violet-500/50"
                    />
                    <span className="text-xs text-slate-400">minutes</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="followUpMsg" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Follow-up Message
                  </label>
                  <textarea
                    id="followUpMsg"
                    rows={2}
                    required
                    placeholder="Sent after the delay to nudge the contact..."
                    value={followUpMessage}
                    onChange={(e) => setFollowUpMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 outline-none resize-none text-sm"
                  />
                </div>
              </div>
            )}

            {/* 6. Final Message & Links */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 space-y-4">
              <label htmlFor="finalMsg" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Final Message + Links
              </label>
              <textarea
                id="finalMsg"
                rows={3}
                placeholder="Final message sent after keywords/email capture are met..."
                value={finalMessage}
                onChange={(e) => setFinalMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 outline-none resize-none text-sm mb-3"
              />
              
              <div className="space-y-3">
                <input
                  type="url"
                  placeholder="Final Link 1"
                  value={finalLink1}
                  onChange={(e) => setFinalLink1(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 outline-none text-sm"
                />
                <input
                  type="url"
                  placeholder="Final Link 2"
                  value={finalLink2}
                  onChange={(e) => setFinalLink2(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 outline-none text-sm"
                />
                <input
                  type="url"
                  placeholder="Final Link 3"
                  value={finalLink3}
                  onChange={(e) => setFinalLink3(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 outline-none text-sm"
                />
              </div>
            </div>

            {/* 7. Collect Email Toggle */}
            <div className="p-4 rounded-2xl border border-slate-900 bg-slate-900/10">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={emailCapture}
                  onChange={(e) => setEmailCapture(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500/30 w-4.5 h-4.5 cursor-pointer"
                />
                <div className="text-sm">
                  <span className="font-semibold text-slate-200 group-hover:text-slate-100 transition-colors">
                    Collect email before sending the link
                  </span>
                  <p className="text-[11px] text-slate-400">Prompts contact to enter their email in the DM flow</p>
                </div>
              </label>
            </div>

            {/* Active Toggle & Buttons */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-900 bg-slate-900/10">
              <span className="text-sm font-semibold text-slate-200">Automation Active Status</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.2)] disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : existingAutomation ? 'Save Changes' : 'Enable Automation'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 rounded-xl font-semibold bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

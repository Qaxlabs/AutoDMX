import { useEffect, useState } from 'react'
import Modal from './Modal'
import { api } from '../lib/api'

const TRIGGER_TYPES = ['Comment', 'DM']

const emptyForm = {
  name: '',
  trigger_type: 'Comment',
  trigger_keywords: '',
  require_follow: false,
  message_1: '',
  link: '',
  collect_email: false,
  collect_phone: false,
}

function parseKeywords(str) {
  return str
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
}

export default function FlowModal({ open, onClose, post, existingFlow, onSave, onDelete }) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Reset or populate form when modal opens or post/existingFlow changes
  useEffect(() => {
    if (open) {
      if (existingFlow) {
        setForm({
          name: existingFlow.name || '',
          trigger_type: existingFlow.trigger_type || 'Comment',
          trigger_keywords: Array.isArray(existingFlow.trigger_keywords)
            ? existingFlow.trigger_keywords.join(', ')
            : '',
          require_follow: !!existingFlow.require_follow,
          message_1: existingFlow.message_1 || '',
          link: existingFlow.link || '',
          collect_email: !!existingFlow.collect_email,
          collect_phone: !!existingFlow.collect_phone,
        })
      } else {
        setForm({
          ...emptyForm,
          name: post ? `Flow for Post ${post.id.substring(0, 6)}` : '',
        })
      }
    }
  }, [open, post, existingFlow])

  if (!post) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        trigger_type: form.trigger_type,
        trigger_keywords: parseKeywords(form.trigger_keywords),
        require_follow: form.require_follow,
        message_1: form.message_1,
        link: form.link.trim() || null,
        collect_email: form.collect_email,
        collect_phone: form.collect_phone,
        active: true,
        media_id: post.id,
      }

      if (existingFlow) {
        await api.updateFlow(existingFlow.id, payload)
      } else {
        await api.createFlow(payload)
      }
      onSave()
      onClose()
    } catch (err) {
      alert(`Failed to save flow: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!existingFlow) return
    if (!confirm(`Are you sure you want to delete the flow "${existingFlow.name}"?`)) return
    setDeleting(true)
    try {
      await api.deleteFlow(existingFlow.id)
      if (onDelete) onDelete(existingFlow.id)
      onClose()
    } catch (err) {
      alert(`Failed to delete flow: ${err.message}`)
    } finally {
      setDeleting(false)
    }
  }

  const modalFooter = (
    <div className="flex w-full items-center justify-between">
      <div>
        {existingFlow && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors cursor-pointer"
          >
            {deleting ? 'Deleting…' : 'Delete Flow'}
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={saving || deleting}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="flow-setup-form"
          disabled={saving || deleting}
          className="btn-primary"
        >
          {saving ? 'Saving…' : existingFlow ? 'Update Flow' : 'Create Flow'}
        </button>
      </div>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existingFlow ? 'Edit Post Automation' : 'Set Up Post Automation'}
      footer={modalFooter}
    >
      <div className="flex gap-4 p-4 bg-zinc-950/40 rounded-lg border border-zinc-800 mb-6">
        <img
          src={post.thumbnail_url}
          alt="Post Thumbnail"
          className="w-20 h-20 object-cover rounded-md border border-zinc-700/50 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            {post.media_type}
          </span>
          <p className="text-sm text-zinc-300 mt-2 line-clamp-2 italic">
            "{post.caption || 'No caption'}"
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            Posted: {new Date(post.timestamp).toLocaleDateString()}
          </p>
        </div>
      </div>

      <form id="flow-setup-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Flow Name</label>
          <input
            className="input"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Ebook Lead Magnet"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Trigger Type</label>
            <select
              className="input"
              value={form.trigger_type}
              onChange={(e) => setForm({ ...form, trigger_type: e.target.value })}
            >
              {TRIGGER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Keywords (comma-separated)</label>
            <input
              className="input"
              value={form.trigger_keywords}
              onChange={(e) => setForm({ ...form, trigger_keywords: e.target.value })}
              placeholder="e.g., free, link, info"
            />
          </div>
        </div>

        <div className="p-3 bg-zinc-950/60 rounded-md border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
          {form.trigger_keywords.trim() === '' ? (
            <p className="flex items-center gap-1.5 text-indigo-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Trigger behavior: replies to <strong>ALL {form.trigger_type.toLowerCase()}s</strong> on this post.
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              Trigger behavior: replies only when comment contains keywords (comma-separated).
            </p>
          )}
        </div>

        <div>
          <label className="label">Message to Send</label>
          <textarea
            className="input min-h-[100px]"
            required
            value={form.message_1}
            onChange={(e) => setForm({ ...form, message_1: e.target.value })}
            placeholder="Hey! 👋 Here's the link you wanted…"
          />
        </div>

        <div>
          <label className="label">Link to Include (optional)</label>
          <input
            className="input"
            type="url"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            placeholder="https://example.com/freebie"
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 border-t border-zinc-800/60">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900"
              checked={form.require_follow}
              onChange={(e) => setForm({ ...form, require_follow: e.target.checked })}
            />
            <span className="text-sm text-zinc-200">Require Follow</span>
            {form.require_follow && (
              <span className="badge-accent bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px]">
                Follow gate active
              </span>
            )}
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                checked={form.collect_email}
                onChange={(e) => setForm({ ...form, collect_email: e.target.checked })}
              />
              <span className="text-sm text-zinc-200">Collect Email</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                checked={form.collect_phone}
                onChange={(e) => setForm({ ...form, collect_phone: e.target.checked })}
              />
              <span className="text-sm text-zinc-200">Collect Phone</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  )
}

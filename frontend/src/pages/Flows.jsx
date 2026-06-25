import { useEffect, useState } from 'react'
import Modal from '../components/Modal'
import { api } from '../lib/api'

const TRIGGER_TYPES = ['Comment', 'DM', 'Story Reply']

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

export default function Flows() {
  const [flows, setFlows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const data = await api.listFlows()
      // Backend returns either an array or {flows: [...]}; normalise.
      setFlows(Array.isArray(data) ? data : (data?.flows || []))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function toggle(flow) {
    try {
      await api.toggleFlow(flow.id)
      await refresh()
    } catch (err) {
      alert(`Failed to toggle: ${err.message}`)
    }
  }

  async function remove(flow) {
    if (!confirm(`Delete flow "${flow.name}"?`)) return
    try {
      await api.deleteFlow(flow.id)
      await refresh()
    } catch (err) {
      alert(`Failed to delete: ${err.message}`)
    }
  }

  async function save(e) {
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
      }
      await api.createFlow(payload)
      setModalOpen(false)
      setForm(emptyForm)
      await refresh()
    } catch (err) {
      alert(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Flows</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Automations that fire when someone comments or DMs you.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          + Create New Flow
        </button>
      </div>

      {error && (
        <div className="card border-red-500/30 bg-red-500/5 mb-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card text-zinc-400 text-sm">Loading flows…</div>
      ) : flows.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-zinc-400">No flows yet.</p>
          <p className="text-zinc-500 text-sm mt-1">
            Click "Create New Flow" to set up your first automation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {flows.map((flow) => (
            <FlowCard
              key={flow.id}
              flow={flow}
              onToggle={() => toggle(flow)}
              onDelete={() => remove(flow)}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Flow"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="flow-form"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving…' : 'Save Flow'}
            </button>
          </>
        }
      >
        <form id="flow-form" onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Flow Name</label>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Freebie Lead Magnet"
            />
          </div>

          <div>
            <label className="label">Trigger Type</label>
            <select
              className="input"
              value={form.trigger_type}
              onChange={(e) => setForm({ ...form, trigger_type: e.target.value })}
            >
              {TRIGGER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Keywords (comma separated)</label>
            <input
              className="input"
              value={form.trigger_keywords}
              onChange={(e) => setForm({ ...form, trigger_keywords: e.target.value })}
              placeholder="free, link, info"
            />
            <p className="text-xs text-zinc-500 mt-1.5">
              Triggered when any keyword appears in a comment or DM.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-accent-500
                         focus:ring-accent-500 focus:ring-offset-zinc-900"
              checked={form.require_follow}
              onChange={(e) => setForm({ ...form, require_follow: e.target.checked })}
            />
            <span className="text-sm text-zinc-200">Require Follow</span>
            {form.require_follow && (
              <span className="badge-accent">Follow gate enabled</span>
            )}
          </label>

          <div>
            <label className="label">Message 1</label>
            <textarea
              className="input min-h-[100px]"
              required
              value={form.message_1}
              onChange={(e) => setForm({ ...form, message_1: e.target.value })}
              placeholder="Hey! 👋 Here's the link you wanted…"
            />
          </div>

          <div>
            <label className="label">Link (optional)</label>
            <input
              className="input"
              type="url"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://example.com/freebie"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-accent-500"
                checked={form.collect_email}
                onChange={(e) => setForm({ ...form, collect_email: e.target.checked })}
              />
              <span className="text-sm text-zinc-200">Collect Email</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-accent-500"
                checked={form.collect_phone}
                onChange={(e) => setForm({ ...form, collect_phone: e.target.checked })}
              />
              <span className="text-sm text-zinc-200">Collect Phone</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function FlowCard({ flow, onToggle, onDelete }) {
  const keywords = Array.isArray(flow.trigger_keywords) ? flow.trigger_keywords : []
  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{flow.name || 'Untitled flow'}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {flow.trigger_type || 'Comment'} trigger
            {flow.require_follow && ' · follow gate'}
          </p>
        </div>
        <label className="inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!flow.active}
            onChange={onToggle}
          />
          <div className="w-10 h-5 bg-zinc-800 rounded-full peer peer-checked:bg-accent-500
                          relative transition-colors after:content-[''] after:absolute
                          after:top-0.5 after:left-0.5 after:bg-white after:rounded-full
                          after:h-4 after:w-4 after:transition-transform
                          peer-checked:after:translate-x-5" />
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {keywords.length > 0
          ? keywords.map((k, i) => <span key={i} className="badge-default">{k}</span>)
          : <span className="text-xs text-zinc-500">No keywords</span>
        }
      </div>

      {flow.message_1 && (
        <p className="text-sm text-zinc-300 line-clamp-3 border-l-2 border-zinc-800 pl-3">
          {flow.message_1}
        </p>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800 mt-auto">
        <span className={`badge ${flow.active ? 'badge-success' : 'badge-default'}`}>
          {flow.active ? 'Active' : 'Inactive'}
        </span>
        {flow.require_follow && <span className="badge-warn">Follow gate</span>}
        {flow.collect_email && <span className="badge-default">+email</span>}
        {flow.collect_phone && <span className="badge-default">+phone</span>}

        <div className="ml-auto flex gap-2">
          <button
            onClick={onDelete}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

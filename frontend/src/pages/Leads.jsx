import { useEffect, useState } from 'react'
import { api, exportLeadsUrl, getBackendUrl } from '../lib/api'

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return d }
}

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const data = await api.listLeads()
      setLeads(Array.isArray(data) ? data : (data?.leads || []))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function remove(lead) {
    if (!confirm('Delete this lead?')) return
    try {
      await api.deleteLead(lead.id)
      await refresh()
    } catch (err) {
      alert(`Failed to delete: ${err.message}`)
    }
  }

  function exportCsv() {
    if (!getBackendUrl()) {
      alert('Set your Backend URL on the Settings page first.')
      return
    }
    // Direct anchor click — browser handles the download from the StreamingResponse.
    const a = document.createElement('a')
    a.href = exportLeadsUrl()
    a.download = 'leads.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const filtered = leads.filter((l) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return [l.username, l.email, l.phone, l.flow_name]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Everyone who's interacted with your flows.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            className="input w-full sm:w-64"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={exportCsv} className="btn-primary shrink-0">
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="card border-red-500/30 bg-red-500/5 mb-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-500
                             border-b border-zinc-800 bg-zinc-950/50">
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Flow</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-400">
                    Loading leads…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    {leads.length === 0 ? 'No leads yet.' : 'No leads match your search.'}
                  </td>
                </tr>
              )}
              {!loading && filtered.map((lead) => (
                <tr key={lead.id}
                    className="border-b border-zinc-800/60 hover:bg-zinc-900/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-100">
                    {lead.username || lead.instagram_user_id || '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{lead.email || '—'}</td>
                  <td className="px-4 py-3 text-zinc-300">{lead.phone || '—'}</td>
                  <td className="px-4 py-3">
                    {lead.flow_name
                      ? <span className="badge-accent">{lead.flow_name}</span>
                      : <span className="text-zinc-500">—</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {formatDate(lead.created_at || lead.updated_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(lead)}
                      className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

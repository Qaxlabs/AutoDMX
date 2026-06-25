import { useEffect, useState } from 'react'
import BarChart from '../components/BarChart'
import { api } from '../lib/api'

// Short weekday label, e.g. "Mon"
const fmtDay = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(5) // fall back to MM-DD
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

function StatCard({ label, value, accent = 'accent' }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="text-3xl font-semibold mt-2 text-zinc-100 font-mono">
        {(value ?? 0).toLocaleString()}
      </p>
      <div className={`mt-3 h-1 rounded-full bg-${accent}-500/40`} />
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.getSummary()
      .then((data) => { if (!cancelled) setSummary(data) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(()    => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return <div className="card text-zinc-400 text-sm">Loading dashboard…</div>
  }
  if (error) {
    return (
      <div className="card border-red-500/30 bg-red-500/5 text-sm text-red-400">
        {error}
        <p className="text-zinc-500 mt-2 text-xs">
          Tip: set your Backend URL on the Settings page.
        </p>
      </div>
    )
  }

  const last7 = summary?.last_7_days || []
  // Build oldest -> newest so the chart reads left-to-right.
  const chartData = [...last7].reverse().map((row) => ({
    label: fmtDay(row.date),
    value: row.dms_sent || 0,
    date: row.date,
  }))
  const maxDms = chartData.reduce((m, d) => Math.max(m, d.value || 0), 0)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Snapshot of your Instagram DM automation.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total DMs Sent"        value={summary?.total_dms_sent} />
        <StatCard label="Total Leads"            value={summary?.total_leads} />
        <StatCard label="Comments Triggered"     value={summary?.total_comments_triggered} />
        <StatCard label="Follows Requested"      value={summary?.total_follows_requested} />
      </div>

      <div className="card">
        <BarChart
          label="DMs Sent — Last 7 Days"
          data={chartData}
          max={maxDms}
          height={200}
        />
      </div>
    </div>
  )
}

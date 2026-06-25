import { useState } from 'react'
import { getBackendUrl, setBackendUrl, testConnection } from '../lib/api'

const IG_NAME_KEY = 'autodmx.instagramAccount'

export default function Settings() {
  const [backendUrl, setBackend] = useState(() => getBackendUrl())
  const [instagramAccount, setInstagramAccount] = useState(
    () => localStorage.getItem(IG_NAME_KEY) || ''
  )
  const [status, setStatus] = useState('idle') // 'idle' | 'testing' | 'connected' | 'failed'
  const [message, setMessage] = useState('')

  function save(e) {
    e.preventDefault()
    setBackendUrl(backendUrl.trim())
    localStorage.setItem(IG_NAME_KEY, instagramAccount.trim())
  }

  async function test() {
    setStatus('testing')
    setMessage('')
    setBackendUrl(backendUrl.trim())
    try {
      const data = await testConnection()
      setStatus('connected')
      setMessage(`Connected — server says "${data.status || 'ok'}"`)
    } catch (err) {
      setStatus('failed')
      setMessage(err.message || 'Connection failed')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-1">Settings</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Connect AutoDMX to your self-hosted FastAPI backend.
      </p>

      <form onSubmit={save} className="card space-y-5">
        <div>
          <label className="label">Backend URL</label>
          <input
            className="input font-mono"
            type="url"
            placeholder="http://localhost:8000"
            value={backendUrl}
            onChange={(e) => setBackend(e.target.value)}
            required
          />
          <p className="text-xs text-zinc-500 mt-1.5">
            The full base URL of your FastAPI server. Saved to localStorage.
          </p>
        </div>

        <div>
          <label className="label">Instagram Account Name</label>
          <input
            className="input"
            type="text"
            placeholder="@yourbrand"
            value={instagramAccount}
            onChange={(e) => setInstagramAccount(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={test}
            disabled={!backendUrl || status === 'testing'}
            className="btn-primary"
          >
            {status === 'testing' ? 'Testing…' : 'Test Connection'}
          </button>
          <button type="submit" className="btn-secondary">Save</button>

          {status === 'connected' && (
            <span className="badge-success">● Connected</span>
          )}
          {status === 'failed' && (
            <span className="badge bg-red-500/15 text-red-400 border border-red-500/30">● Failed</span>
          )}
        </div>

        {message && (
          <p className={`text-sm ${
            status === 'connected' ? 'text-emerald-400' :
            status === 'failed'    ? 'text-red-400' :
                                     'text-zinc-400'
          }`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function FAQs() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [saving, setSaving] = useState(false)

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const data = await api.listFaqs()
      setFaqs(Array.isArray(data) ? data : (data?.faqs || []))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function addFaq(e) {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) return
    setSaving(true)
    try {
      await api.createFaq({ question: question.trim(), answer: answer.trim() })
      setQuestion('')
      setAnswer('')
      await refresh()
    } catch (err) {
      alert(`Failed to save FAQ: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function remove(faq) {
    if (!confirm('Delete this FAQ?')) return
    try {
      await api.deleteFaq(faq.id)
      await refresh()
    } catch (err) {
      alert(`Failed to delete: ${err.message}`)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-1">FAQs</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Common questions the AI will use to answer incoming DMs automatically.
      </p>

      <form onSubmit={addFaq} className="card space-y-3 mb-6">
        <h2 className="font-semibold text-sm text-zinc-300">Add a new FAQ</h2>
        <div>
          <label className="label">Question</label>
          <input
            className="input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="How much does shipping cost?"
            required
          />
        </div>
        <div>
          <label className="label">Answer</label>
          <textarea
            className="input min-h-[80px]"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="We offer free shipping on orders over $50…"
            required
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Add FAQ'}
          </button>
        </div>
      </form>

      {error && (
        <div className="card border-red-500/30 bg-red-500/5 mb-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card text-zinc-400 text-sm">Loading FAQs…</div>
      ) : faqs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-zinc-400">No FAQs yet.</p>
          <p className="text-zinc-500 text-sm mt-1">
            Add a few common questions above to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-medium text-zinc-100">{faq.question}</h3>
                  <p className="text-sm text-zinc-400 mt-1 whitespace-pre-wrap">
                    {faq.answer}
                  </p>
                </div>
                <button
                  onClick={() => remove(faq)}
                  className="shrink-0 text-xs text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

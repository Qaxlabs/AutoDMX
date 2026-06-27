import { useEffect, useState } from 'react'
import FlowModal from '../components/FlowModal'
import { api } from '../lib/api'

export default function Flows() {
  const [flows, setFlows] = useState([])
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMedia, setLoadingMedia] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('posts') // 'posts' or 'flows'
  
  // Setup modal state
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedFlow, setSelectedFlow] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  async function refreshFlows() {
    try {
      const data = await api.listFlows()
      setFlows(Array.isArray(data) ? data : (data?.flows || []))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function refreshMedia() {
    setLoadingMedia(true)
    try {
      const res = await api.listInstagramMedia()
      setMedia(res?.media || [])
    } catch (err) {
      console.error("Failed to load Instagram media:", err)
    } finally {
      setLoadingMedia(false)
    }
  }

  useEffect(() => {
    refreshFlows()
    refreshMedia()
  }, [])

  async function handleToggleFlow(flow) {
    try {
      await api.toggleFlow(flow.id)
      await refreshFlows()
    } catch (err) {
      alert(`Failed to toggle: ${err.message}`)
    }
  }

  async function handleRemoveFlow(flow) {
    if (!confirm(`Delete flow "${flow.name}"?`)) return
    try {
      await api.deleteFlow(flow.id)
      await refreshFlows()
    } catch (err) {
      alert(`Failed to delete: ${err.message}`)
    }
  }

  function handlePostClick(post) {
    const flow = flows.find((f) => f.media_id === post.id)
    setSelectedPost(post)
    setSelectedFlow(flow || null)
    setModalOpen(true)
  }

  function handleModalSave() {
    refreshFlows()
    refreshMedia()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Automations & Flows
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Connect interactive response flows to your Instagram posts, reels, or stories.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg self-start sm:self-center">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'posts'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Posts & Reels Grid
          </button>
          <button
            onClick={() => setActiveTab('flows')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'flows'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Active Flows ({flows.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="card border-red-500/30 bg-red-500/5 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Posts Grid View */}
      {activeTab === 'posts' && (
        <div>
          {loadingMedia ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse space-y-4">
                  <div className="aspect-square bg-zinc-800 rounded-lg" />
                  <div className="h-4 bg-zinc-800 rounded w-2/3" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : media.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-zinc-400">No Instagram posts found.</p>
              <p className="text-zinc-500 text-sm mt-1.5">
                Verify your Meta API credentials on the Settings page to link posts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {media.map((post) => {
                const assignedFlow = flows.find((f) => f.media_id === post.id)
                return (
                  <div
                    key={post.id}
                    onClick={() => handlePostClick(post)}
                    className="card flex flex-col group cursor-pointer hover:border-zinc-700/80 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden bg-zinc-900/60"
                  >
                    {/* Media Thumbnail Container */}
                    <div className="aspect-video relative overflow-hidden bg-zinc-950 rounded-t-lg -mx-5 -mt-5 mb-4 border-b border-zinc-800">
                      <img
                        src={post.thumbnail_url}
                        alt="Instagram media"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Media Type Badge Overlay */}
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[10px] uppercase font-bold text-zinc-300 px-2 py-1 rounded border border-white/10">
                        {post.media_type}
                      </span>

                      {/* Flow Status Badge Overlay */}
                      {assignedFlow ? (
                        assignedFlow.active ? (
                          <span className="absolute bottom-3 right-3 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md border border-purple-400 flex items-center gap-1.5 animate-pulse-subtle">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            Flow Active
                          </span>
                        ) : (
                          <span className="absolute bottom-3 right-3 bg-amber-500 text-zinc-950 text-[10px] font-bold px-2 py-1 rounded shadow-md border border-amber-400">
                            Flow Inactive
                          </span>
                        )
                      ) : (
                        <span className="absolute bottom-3 right-3 bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded border border-zinc-700">
                          No Flow
                        </span>
                      )}
                    </div>

                    {/* Post Info */}
                    <div className="flex-1 flex flex-col">
                      <p className="text-zinc-200 text-sm line-clamp-2 italic mb-3">
                        "{post.caption || 'No caption description'}"
                      </p>
                      
                      <div className="mt-auto pt-3 border-t border-zinc-800/60 flex justify-between items-center text-xs text-zinc-500">
                        <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                        {assignedFlow && (
                          <span className="text-purple-400 font-semibold truncate max-w-[150px]">
                            {assignedFlow.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Traditional Flows List View */}
      {activeTab === 'flows' && (
        <div>
          {loading ? (
            <div className="card text-zinc-400 text-sm">Loading active flows…</div>
          ) : flows.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-zinc-400">No active flows configured.</p>
              <p className="text-zinc-500 text-sm mt-1">
                Go to the "Posts & Reels Grid" to set up automations for specific posts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {flows.map((flow) => (
                <FlowCard
                  key={flow.id}
                  flow={flow}
                  onToggle={() => handleToggleFlow(flow)}
                  onDelete={() => handleRemoveFlow(flow)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Setup & Edit Modal */}
      <FlowModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        post={selectedPost}
        existingFlow={selectedFlow}
        onSave={handleModalSave}
        onDelete={() => {
          refreshFlows()
          refreshMedia()
        }}
      />
    </div>
  )
}

function FlowCard({ flow, onToggle, onDelete }) {
  const keywords = Array.isArray(flow.trigger_keywords) ? flow.trigger_keywords : []
  return (
    <div className="card flex flex-col gap-4 bg-zinc-900/40 border-zinc-800 hover:border-zinc-700/80 transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold truncate text-zinc-100">{flow.name || 'Untitled flow'}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {flow.trigger_type || 'Comment'} trigger
            {flow.require_follow && ' · follow gate'}
            {flow.media_id && ' · post-specific'}
          </p>
        </div>
        <label className="inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!flow.active}
            onChange={onToggle}
          />
          <div className="w-10 h-5 bg-zinc-800 rounded-full peer peer-checked:bg-indigo-600
                          relative transition-colors after:content-[''] after:absolute
                          after:top-0.5 after:left-0.5 after:bg-white after:rounded-full
                          after:h-4 after:w-4 after:transition-transform
                          peer-checked:after:translate-x-5" />
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {keywords.length > 0 ? (
          keywords.map((k, i) => (
            <span key={i} className="badge-default bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded text-xs">
              {k}
            </span>
          ))
        ) : (
          <span className="text-xs text-indigo-400 font-medium italic bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
            Replies to ALL {flow.trigger_type?.toLowerCase() || 'comment'}s
          </span>
        )}
      </div>

      {flow.message_1 && (
        <p className="text-sm text-zinc-300 line-clamp-3 border-l-2 border-zinc-800 pl-3 italic">
          "{flow.message_1}"
        </p>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-zinc-800 mt-auto">
        <span className={`badge ${flow.active ? 'badge-success bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'badge-default bg-zinc-800 text-zinc-400 border border-zinc-700'} px-2.5 py-0.5 rounded text-xs`}>
          {flow.active ? 'Active' : 'Inactive'}
        </span>
        {flow.require_follow && <span className="badge-warn bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-xs">Follow gate</span>}
        {flow.collect_email && <span className="badge-default bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded text-xs">+email</span>}
        {flow.collect_phone && <span className="badge-default bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded text-xs">+phone</span>}

        <div className="ml-auto flex gap-2">
          <button
            onClick={onDelete}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

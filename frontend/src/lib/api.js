// Tiny API client. Reads Backend URL from localStorage on every call so
// users can change it on the Settings page without reloading the world.

const SETTINGS_KEY = 'autodmx.backendUrl'

export function getBackendUrl() {
  const url = localStorage.getItem(SETTINGS_KEY) || ''
  return url.replace(/\/+$/, '') // strip trailing slashes
}

export function setBackendUrl(url) {
  localStorage.setItem(SETTINGS_KEY, url)
}

// --- low-level fetch helpers ------------------------------------------------

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const base = getBackendUrl()
  if (!base) {
    throw new Error('Backend URL is not set. Configure it on the Settings page.')
  }
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const data = await res.json()
      if (data?.detail) detail = data.detail
    } catch { /* not JSON */ }
    throw new Error(detail)
  }
  const contentType = res.headers.get('content-type') || ''
  return contentType.includes('application/json') ? res.json() : res.text()
}

export async function testConnection() {
  const base = getBackendUrl()
  if (!base) throw new Error('Backend URL is not set')
  const res = await fetch(`${base}/health`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// --- domain endpoints -------------------------------------------------------

export const api = {
  // Settings
  testConnection,

  // Flows
  listFlows:   ()               => request('/flows'),
  createFlow:  (flow)           => request('/flows', { method: 'POST', body: flow }),
  updateFlow:  (id, flow)       => request(`/flows/${id}`, { method: 'PUT', body: flow }),
  toggleFlow:  (id)             => request(`/flows/${id}/toggle`, { method: 'PATCH' }),
  deleteFlow:  (id)             => request(`/flows/${id}`, { method: 'DELETE' }),

  // FAQs
  listFaqs:    ()               => request('/faqs'),
  createFaq:   (faq)            => request('/faqs', { method: 'POST', body: faq }),
  deleteFaq:   (id)             => request(`/faqs/${id}`, { method: 'DELETE' }),

  // Leads
  listLeads:   ()               => request('/leads'),
  exportLeadsUrl: ()            => `${getBackendUrl()}/leads/export`,
  deleteLead:  (id)             => request(`/leads/${id}`, { method: 'DELETE' }),

  // Analytics
  getSummary:  ()               => request('/analytics/summary'),
}

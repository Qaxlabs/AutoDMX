import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Flows from './pages/Flows'
import FAQs from './pages/FAQs'
import Leads from './pages/Leads'
import Settings from './pages/Settings'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-full flex bg-zinc-950 text-zinc-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden h-16 px-4 flex items-center gap-3 border-b border-zinc-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-zinc-300 hover:text-zinc-100"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-500 to-accent-700
                          flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="font-semibold">AutoDMX</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/"         element={<Dashboard />} />
            <Route path="/flows"    element={<Flows />} />
            <Route path="/faqs"     element={<FAQs />} />
            <Route path="/leads"    element={<Leads />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*"         element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

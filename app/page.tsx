import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Background Glowing Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              AutoDMX
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              Dashboard
            </Link>
            <a 
              href="https://github.com/Qaxlabs/AutoDMX" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-950/30 text-violet-300 text-xs font-medium mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          Instagram Comment-to-DM Automation
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl leading-tight">
          Turn Comments into{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
            Conversions
          </span>{" "}
          Instantly
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          The open-source, self-hosted Instagram automation platform. Engage your audience, deliver lead magnets, and grow sales straight from your comments.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-24">
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transform hover:-translate-y-0.5 text-center"
          >
            Launch Dashboard
          </Link>
          <a
            href="https://github.com/Qaxlabs/AutoDMX"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-xl font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all duration-300 text-center"
          >
            GitHub Repository
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 w-full text-left">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-violet-950/50 border border-violet-800/50 flex items-center justify-center mb-6 group-hover:bg-violet-900/50 transition-colors">
              <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">AES-256 Encryption</h3>
            <p className="text-slate-400 leading-relaxed">
              Instagram access tokens are encrypted at rest with AES-256-GCM before database writes, keeping data fully secure.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm hover:border-fuchsia-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-950/50 border border-fuchsia-800/50 flex items-center justify-center mb-6 group-hover:bg-fuchsia-900/50 transition-colors">
              <svg className="w-6 h-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">Self-Hosted Simplicity</h3>
            <p className="text-slate-400 leading-relaxed">
              Run background tasks serverlessly via Netlify scheduled functions and GitHub Actions. No heavy Redis server required.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-blue-950/50 border border-blue-800/50 flex items-center justify-center mb-6 group-hover:bg-blue-900/50 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">Meta API Guardrails</h3>
            <p className="text-slate-400 leading-relaxed">
              Rate limiting is enforced at the database level. Respects Meta limits out-of-the-box to keep your Instagram accounts active.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/40 relative z-10 py-12 text-center text-xs text-slate-500">
        <div className="flex justify-center gap-6 mb-6 text-slate-400">
          <Link href="/privacy" className="hover:text-slate-200 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-200 transition-colors">Terms of Service</Link>
          <Link href="/data-deletion" className="hover:text-slate-200 transition-colors">Data Deletion</Link>
        </div>
        <p>© {new Date().getFullYear()} AutoDMX. Built with Next.js, Supabase, and Tailwind CSS.</p>
      </footer>
    </div>
  );
}

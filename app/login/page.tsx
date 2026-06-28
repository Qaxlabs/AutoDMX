import Link from 'next/link';
import { login } from './actions';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center overflow-hidden font-sans p-6">
      {/* Background Glowing Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

      {/* Header link */}
      <Link href="/" className="mb-8 text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
        AutoDMX
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md p-8 rounded-2xl border border-slate-900 bg-slate-900/40 backdrop-blur-md shadow-2xl relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome Back</h1>
          <p className="text-sm text-slate-400 mt-2">Sign in to manage your automated campaigns</p>
        </div>

        {/* Error Alert */}
        {searchParams.error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{decodeURIComponent(searchParams.error)}</span>
          </div>
        )}

        <form action={login} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@domain.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-900 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

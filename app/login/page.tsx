import Link from "next/link";
import { login } from "./actions";
import { BrandMark } from "../_components/SocialLinks";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-hero-glow"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandMark />
        </div>

        <div className="glass-strong relative overflow-hidden rounded-2xl p-8 shadow-2xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-40 w-[300px] -translate-x-1/2 rounded-full bg-brand-500/30 blur-3xl"
          />
          <div className="relative">
            <div className="mb-7 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Sign in to the dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Enter the dashboard password to continue.
              </p>
            </div>

            {searchParams.error && (
              <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 h-4 w-4 shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
                <span>{decodeURIComponent(searchParams.error)}</span>
              </div>
            )}

            <form action={login} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400"
                >
                  Dashboard password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/8 bg-ink-900/60 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all focus:border-brand-400/50 focus:bg-ink-900 focus:ring-2 focus:ring-brand-400/20"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3.5 text-sm"
              >
                Unlock dashboard
              </button>
            </form>

            <div className="mt-7 border-t border-white/5 pt-5 text-center">
              <Link
                href="/"
                className="text-xs font-medium text-slate-400 transition-colors hover:text-slate-200"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          Self-hosted by Qaxlabs ·{" "}
          <Link href="/privacy" className="hover:text-slate-300">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="hover:text-slate-300">
            Terms
          </Link>
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { login } from "./actions";
import { BrandMark } from "../_components/SocialLinks";
import { ThemeToggle } from "../_components/ThemeToggle";
import { AlertCircle, Lock } from "lucide-react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#fafafc] px-5 py-16 dark:bg-[#09090b]">
      <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandMark />
        </div>

        <div className="rounded-3xl border border-neutral-200/80 bg-white p-8 shadow-sm sm:p-10 dark:border-neutral-800 dark:bg-neutral-900/60 dark:shadow-2xl">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Lock className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Sign in to the dashboard
            </h1>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Enter the dashboard password to continue.
            </p>
          </div>

          {searchParams.error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/60 p-3.5 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{decodeURIComponent(searchParams.error)}</span>
            </div>
          )}

          <form action={login} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[11px] font-mono font-medium tracking-wider text-neutral-600 uppercase dark:text-neutral-400"
              >
                Dashboard password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="apple-input py-2.5"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-2.5 text-sm"
            >
              Unlock dashboard
            </button>
          </form>

          <div className="mt-7 border-t border-neutral-100 pt-5 text-center dark:border-neutral-800">
            <Link
              href="/"
              className="text-xs font-medium text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
          Self-hosted by Qaxlabs ·{" "}
          <Link href="/privacy" className="hover:text-neutral-900 dark:hover:text-neutral-300">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="hover:text-neutral-900 dark:hover:text-neutral-300">
            Terms
          </Link>
        </p>
      </div>
    </div>
  );
}

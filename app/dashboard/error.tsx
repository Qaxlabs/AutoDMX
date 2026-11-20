'use client';

import { useEffect } from 'react';
import { AppShell } from '../_components/AppShell';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error Boundary]', error);
  }, [error]);

  return (
    <AppShell variant="dashboard">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50/60 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {error.message || 'An unexpected error occurred while loading this page.'}
          </p>
          {error.digest && (
            <p className="mt-3 font-mono text-xs text-neutral-400">
              Digest: {error.digest}
            </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Try again
            </button>
            <Link
              href="/dashboard"
              className="btn-secondary px-4 py-2 text-xs"
            >
              Go to overview
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}


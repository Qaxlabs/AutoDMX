import { ContactEmail, BackToHome } from '../_components/ContactEmail';
import { AppShell } from '../_components/AppShell';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <AppShell variant="marketing" hideFooter>
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8">
          <BackToHome />
        </div>

        <article className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-8 shadow-sm sm:p-12 dark:border-neutral-800 dark:bg-neutral-900/60 dark:shadow-2xl">
          <header className="border-b border-neutral-200/80 pb-6 dark:border-neutral-800">
            <p className="text-[11px] font-mono font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
              Legal
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
              Terms of service
            </h1>
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
              Last updated: June 29, 2026
            </p>
          </header>

          <div className="mt-8 space-y-7 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            <p>
              By interacting with this Instagram account&apos;s automated
              replies, you agree to the following:
            </p>

            <div className="h-px bg-neutral-200/70 dark:bg-neutral-800" />

            <ol className="ml-4 list-decimal space-y-4 pl-2 text-neutral-600 dark:text-neutral-300">
              <li>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  Automated messaging:
                </span>{' '}
                This account uses automated messaging to respond to comments
                and direct messages.
              </li>
              <li>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  Interactive responses:
                </span>{' '}
                Automated responses may include links, follow-up questions, and
                requests to follow the account before certain content is
                released.
              </li>
              <li>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  Free to interact:
                </span>{' '}
                No purchase or payment is required to interact with this
                automation.
              </li>
              <li>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  Availability:
                </span>{' '}
                We do not guarantee uninterrupted availability of automated
                replies.
              </li>
              <li>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  Support & feedback:
                </span>{' '}
                Contact <ContactEmail variant="strong" /> with any questions or
                concerns.
              </li>
            </ol>

            <div className="h-px bg-neutral-200/70 dark:bg-neutral-800" />

            <p className="text-xs text-neutral-500">
              This is an open-source project. Source code is available on GitHub
              at:{' '}
              <Link
                href="https://github.com/Qaxlabs/AutoDMX"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-900 underline dark:text-white hover:opacity-80"
              >
                github.com/Qaxlabs/AutoDMX
              </Link>
            </p>
          </div>
        </article>
      </div>
    </AppShell>
  );
}

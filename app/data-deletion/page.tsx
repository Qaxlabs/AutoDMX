import { ContactEmail, BackToHome } from '../_components/ContactEmail';
import { AppShell } from '../_components/AppShell';

export default function DataDeletionPage() {
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
              Data deletion instructions
            </h1>
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
              Last updated: June 29, 2026
            </p>
          </header>

          <div className="mt-8 space-y-7 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            <p>
              To request deletion of any personal data AutoDMX has collected or
              processed about you (including comments, direct messages,
              Instagram profile details, or your captured email address),
              please follow these instructions:
            </p>

            <div className="h-px bg-neutral-200/70 dark:bg-neutral-800" />

            <section>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                How to request deletion
              </h2>
              <ol className="mt-3 ml-4 list-decimal space-y-3 pl-2 text-neutral-600 dark:text-neutral-400">
                <li>
                  Send an email to <ContactEmail variant="strong" />.
                </li>
                <li>
                  Use the subject line:{' '}
                  <span className="select-all rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                    AutoDMX Data Deletion Request
                  </span>
                </li>
                <li>
                  Include the exact{' '}
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    Instagram username
                  </span>{' '}
                  you used to interact with our automated posts or replies.
                </li>
              </ol>
            </section>

            <div className="h-px bg-neutral-200/70 dark:bg-neutral-800" />

            <section>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Processing timeframe
              </h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Your data will be permanently and securely deleted from our
                databases within{' '}
                <span className="font-semibold text-neutral-900 dark:text-white">30 days</span> of
                receiving your email request. A confirmation email will be sent
                back to you once the deletion process is complete.
              </p>
            </section>
          </div>
        </article>
      </div>
    </AppShell>
  );
}

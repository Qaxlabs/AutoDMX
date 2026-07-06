import { ContactEmail, BackToHome } from '../_components/ContactEmail';
import { AppShell } from '../_components/AppShell';

export default function DataDeletionPage() {
  return (
    <AppShell variant="marketing" hideFooter>
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="mb-8">
          <BackToHome />
        </div>

        <article className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-sm sm:p-12">
          <header className="border-b border-white/5 pb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">
              Legal
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Data deletion instructions
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Last updated: June 29, 2026
            </p>
          </header>

          <div className="mt-8 space-y-7 text-sm leading-relaxed text-slate-300">
            <p>
              To request deletion of any personal data AutoDMX has collected or
              processed about you (including comments, direct messages,
              Instagram profile details, or your captured email address),
              please follow these instructions:
            </p>

            <div className="h-px bg-white/5" />

            <section>
              <h2 className="text-base font-semibold text-white">
                How to request deletion
              </h2>
              <ol className="mt-2 ml-4 list-decimal space-y-3 pl-2 text-slate-300">
                <li>
                  Send an email to <ContactEmail variant="strong" />.
                </li>
                <li>
                  Use the subject line:{' '}
                  <span className="select-all rounded-md border border-white/8 bg-ink-900 px-2 py-1 font-mono text-xs text-brand-300">
                    AutoDMX Data Deletion Request
                  </span>
                </li>
                <li>
                  Include the exact{' '}
                  <span className="font-semibold text-white">
                    Instagram username
                  </span>{' '}
                  you used to interact with our automated posts or replies.
                </li>
              </ol>
            </section>

            <div className="h-px bg-white/5" />

            <section>
              <h2 className="text-base font-semibold text-white">
                Processing timeframe
              </h2>
              <p className="mt-2 text-slate-400">
                Your data will be permanently and securely deleted from our
                databases within{' '}
                <span className="font-semibold text-white">30 days</span> of
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

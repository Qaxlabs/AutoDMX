import { ContactEmail, ContactBlock, BackToHome } from '../_components/ContactEmail';
import { AppShell } from '../_components/AppShell';

export default function PrivacyPage() {
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
              Privacy policy
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Last updated: June 29, 2026
            </p>
          </header>

          <div className="mt-8 space-y-7 text-sm leading-relaxed text-slate-300">
            <p>
              AutoDMX is an open-source, self-hosted Instagram automation tool.
              This deployment is operated by{' '}
              <ContactEmail variant="strong" /> for use with a single connected
              Instagram account.
            </p>

            <div className="h-px bg-white/5" />

            <Section title="1. Data we process">
              <ul className="ml-4 list-disc space-y-1.5 pl-2 text-slate-400">
                <li>
                  Instagram comments and direct messages sent to the connected
                  account.
                </li>
                <li>
                  Instagram-scoped user IDs, usernames, and profile pictures of
                  people who interact with the connected account.
                </li>
                <li>Email addresses, only if explicitly provided.</li>
                <li>
                  Message content sent and received through automated
                  conversations.
                </li>
              </ul>
            </Section>

            <Section title="2. How data is used">
              Solely to operate the automation features of this app: replying to
              comments, sending direct messages, tracking conversation state,
              and basic analytics for the account operator.
            </Section>

            <Section title="3. Data storage">
              Data is stored in a Supabase (PostgreSQL) database controlled by
              the account operator. Instagram access tokens are encrypted at
              rest. We do not sell or share data with third parties beyond
              what&apos;s required to operate the service (Meta&apos;s Instagram
              API).
            </Section>

            <Section title="4. Data retention">
              Data is retained until manually deleted by the account operator,
              or upon a deletion request (see Data Deletion Instructions).
            </Section>

            <Section title="5. Your rights">
              You may request deletion of your data at any time by contacting{' '}
              <ContactEmail variant="strong" />.
            </Section>

            <div className="h-px bg-white/5" />

            <Section title="Contact">
              <ContactBlock />
            </Section>
          </div>
        </article>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="mt-2 text-slate-400">{children}</div>
    </section>
  );
}

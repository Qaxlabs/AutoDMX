import { ContactEmail, ContactBlock, BackToHome } from '../_components/ContactEmail';
import { AppShell } from '../_components/AppShell';

export default function PrivacyPage() {
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
              Privacy policy
            </h1>
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
              Last updated: June 29, 2026
            </p>
          </header>

          <div className="mt-8 space-y-7 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            <p>
              AutoDMX is an open-source, self-hosted Instagram automation tool.
              This deployment is operated by{' '}
              <ContactEmail variant="strong" /> for use with a single connected
              Instagram account.
            </p>

            <div className="h-px bg-neutral-200/70 dark:bg-neutral-800" />

            <Section title="1. Data we process">
              <ul className="ml-4 list-disc space-y-1.5 pl-2 text-neutral-600 dark:text-neutral-400">
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
              rest with AES-256-GCM. We do not sell or share data with third parties beyond
              what&apos;s required to operate the service (Meta&apos;s Instagram API).
            </Section>

            <Section title="4. Data retention">
              Data is retained until manually deleted by the account operator,
              or upon a deletion request (see Data Deletion Instructions).
            </Section>

            <Section title="5. Your rights">
              You may request deletion of your data at any time by contacting{' '}
              <ContactEmail variant="strong" />.
            </Section>

            <div className="h-px bg-neutral-200/70 dark:bg-neutral-800" />

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
      <h2 className="text-base font-semibold text-neutral-900 dark:text-white">{title}</h2>
      <div className="mt-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">{children}</div>
    </section>
  );
}

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden py-16 px-6">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Navigation back */}
        <div className="mb-10">
          <Link href="/" className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1">
            &larr; Back to Home
          </Link>
        </div>

        {/* Document Card */}
        <div className="p-8 sm:p-12 rounded-3xl border border-slate-900 bg-slate-900/20 backdrop-blur-md shadow-2xl space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-xs text-slate-500">Last updated: June 29, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none text-slate-350 text-sm leading-relaxed space-y-6">
            <p>
              AutoDMX is an open-source, self-hosted Instagram automation tool.
              This deployment is operated by <a href="mailto:qaxilabs@gmail.com" className="text-violet-400 hover:underline">qaxilabs@gmail.com</a> for use with a single connected Instagram account.
            </p>

            <hr className="border-slate-900" />

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-100">1. Data we process</h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-400">
                <li>Instagram comments and direct messages sent to the connected account.</li>
                <li>Instagram-scoped user IDs, usernames, and profile pictures of people who interact with the connected account.</li>
                <li>Email addresses, only if explicitly provided during an automation flow.</li>
                <li>Message content sent and received through automated conversations.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-100">2. How data is used</h2>
              <p className="text-slate-400">
                Solely to operate the automation features of this app: replying to comments, sending direct messages, tracking conversation state, and basic analytics for the account operator.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-100">3. Data storage</h2>
              <p className="text-slate-400">
                Data is stored in a Supabase (PostgreSQL) database controlled by the account operator. Instagram access tokens are encrypted at rest. We do not sell or share data with third parties beyond what&apos;s required to operate the service (Meta&apos;s Instagram API).
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-100">4. Data retention</h2>
              <p className="text-slate-400">
                Data is retained until manually deleted by the account operator, or upon a deletion request (see Data Deletion Instructions).
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-100">5. Your rights</h2>
              <p className="text-slate-400">
                You may request deletion of your data at any time by contacting{' '}
                <a href="mailto:qaxilabs@gmail.com" className="text-violet-400 hover:underline">
                  qaxilabs@gmail.com
                </a>.
              </p>
            </div>

            <hr className="border-slate-900" />

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-100">Contact</h2>
              <p className="text-slate-400">
                Email:{' '}
                <a href="mailto:qaxilabs@gmail.com" className="text-violet-400 hover:underline font-semibold">
                  qaxilabs@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

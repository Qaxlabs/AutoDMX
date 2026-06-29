import Link from 'next/link';

export default function TermsPage() {
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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Terms of Service</h1>
            <p className="text-xs text-slate-500">Last updated: June 29, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none text-slate-350 text-sm leading-relaxed space-y-6">
            <p className="text-slate-400">
              By interacting with this Instagram account&apos;s automated replies, you agree to the following:
            </p>

            <hr className="border-slate-900" />

            <ol className="list-decimal list-inside space-y-4 text-slate-400 pl-2">
              <li className="leading-relaxed">
                <span className="font-semibold text-slate-200">Automated Messaging:</span> This account uses automated messaging to respond to comments and direct messages.
              </li>
              <li className="leading-relaxed">
                <span className="font-semibold text-slate-200">Interactive Responses:</span> Automated responses may include links, follow-up questions, and requests to follow the account before certain content is released.
              </li>
              <li className="leading-relaxed">
                <span className="font-semibold text-slate-200">Free to Interact:</span> No purchase or payment is required to interact with this automation.
              </li>
              <li className="leading-relaxed">
                <span className="font-semibold text-slate-200">Availability:</span> We do not guarantee uninterrupted availability of automated replies.
              </li>
              <li className="leading-relaxed">
                <span className="font-semibold text-slate-200">Support & Feedback:</span> Contact{' '}
                <a href="mailto:qaxilabs@gmail.com" className="text-violet-400 hover:underline">
                  qaxilabs@gmail.com
                </a>{' '}
                with any questions or concerns.
              </li>
            </ol>

            <hr className="border-slate-900" />

            <p className="text-xs text-slate-500 italic">
              This is an open-source project. Source code is available on GitHub at:{' '}
              <a
                href="https://github.com/Qaxlabs/AutoDMX"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:underline not-italic font-semibold"
              >
                github.com/Qaxlabs/AutoDMX
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

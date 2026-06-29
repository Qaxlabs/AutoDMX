import Link from 'next/link';

export default function DataDeletionPage() {
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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Data Deletion Instructions</h1>
            <p className="text-xs text-slate-500">Last updated: June 29, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none text-slate-350 text-sm leading-relaxed space-y-6">
            <p className="text-slate-400 leading-relaxed">
              To request deletion of any personal data AutoDMX has collected or processed about you (including comments, direct messages, Instagram profile details, or your captured email address), please follow these instructions:
            </p>

            <hr className="border-slate-900" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-100">How to request deletion</h2>
              <ol className="list-decimal list-inside space-y-3 text-slate-400 pl-2">
                <li>
                  Send an email to{' '}
                  <a href="mailto:qaxilabs@gmail.com" className="text-violet-400 hover:underline font-semibold">
                    qaxilabs@gmail.com
                  </a>.
                </li>
                <li>
                  Use the subject line:{' '}
                  <span className="bg-slate-900 px-2 py-1 rounded text-violet-400 font-mono text-xs select-all">
                    AutoDMX Data Deletion Request
                  </span>
                </li>
                <li>
                  Include the exact <span className="font-semibold text-slate-200">Instagram username</span> you used to interact with our automated posts or replies.
                </li>
              </ol>
            </div>

            <hr className="border-slate-900" />

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-100">Processing Timeframe</h2>
              <p className="text-slate-400">
                Your data will be permanently and securely deleted from our databases within <span className="font-semibold text-slate-200">30 days</span> of receiving your email request. A confirmation email will be sent back to you once the deletion process is complete.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

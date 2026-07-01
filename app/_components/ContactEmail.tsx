import Link from 'next/link';

interface ContactEmailProps {
  /** Override the contact email (defaults to NEXT_PUBLIC_CONTACT_EMAIL env var) */
  email?: string;
  /** Display name for the operator (defaults to OPERATOR_NAME env var) */
  operatorName?: string;
  /** Visual style for the email link */
  variant?: 'default' | 'subtle' | 'strong';
  /** Optional className for the wrapping element */
  className?: string;
  /** Render as inline text (no link) — useful when wrapped in another anchor or button */
  asLink?: boolean;
}

/**
 * Renders the operator's contact email sourced from `NEXT_PUBLIC_CONTACT_EMAIL`.
 * Falls back to a placeholder if the env var is not set, so the page never
 * ships a hardcoded address.
 */
export function ContactEmail({
  email,
  operatorName,
  variant = 'default',
  className = '',
  asLink = true,
}: ContactEmailProps) {
  const resolvedEmail =
    email ?? process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'your-contact-email@example.com';
  const resolvedName = operatorName ?? process.env.OPERATOR_NAME ?? null;

  const linkClass =
    variant === 'strong'
      ? 'text-violet-400 hover:underline font-semibold'
      : variant === 'subtle'
        ? 'text-violet-400/80 hover:underline'
        : 'text-violet-400 hover:underline';

  const content = (
    <>
      {resolvedName ? <span className={linkClass}>{resolvedEmail}</span> : resolvedEmail}
    </>
  );

  if (!asLink) {
    return <span className={className}>{resolvedEmail}</span>;
  }

  return (
    <a href={`mailto:${resolvedEmail}`} className={`${linkClass} ${className}`.trim()}>
      {resolvedEmail}
    </a>
  );
}

/**
 * Footer / signature line that shows the operator name and contact email together.
 * Used at the bottom of the privacy, terms, and data-deletion pages.
 */
export function ContactBlock({
  email,
  operatorName,
  className = '',
}: {
  email?: string;
  operatorName?: string;
  className?: string;
}) {
  const resolvedEmail =
    email ?? process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'your-contact-email@example.com';
  const resolvedName = operatorName ?? process.env.OPERATOR_NAME ?? 'the account operator';

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <p className="text-slate-400">
        <span className="font-semibold text-slate-200">Operator:</span> {resolvedName}
      </p>
      <p className="text-slate-400">
        <span className="font-semibold text-slate-200">Email: </span>
        <ContactEmail email={resolvedEmail} operatorName={resolvedName} variant="strong" />
      </p>
    </div>
  );
}

/**
 * Compact link back to home, used at the top of legal pages.
 */
export function BackToHome({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1 ${className}`.trim()}
    >
      &larr; Back to Home
    </Link>
  );
}

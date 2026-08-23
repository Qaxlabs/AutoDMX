import Link from "next/link";
import { AutoDMXLogo } from "./AutoDMXLogo";

/**
 * Central place to declare the operator's social handles.
 * Used by the brand mark, footer, hero CTAs, and the "Community" page section.
 */
export const SOCIALS = {
  instagram: {
    label: "Instagram",
    handle: "@qaxlabs",
    href: "https://instagram.com/qaxlabs",
  },
  youtube: {
    label: "YouTube",
    handle: "@Qaxlabs",
    href: "https://www.youtube.com/@Qaxlabs",
  },
  x: {
    label: "X",
    handle: "@qaxlabs",
    href: "https://x.com/qaxlabs",
  },
  github: {
    label: "GitHub",
    handle: "Qaxlabs/AutoDMX",
    href: "https://github.com/Qaxlabs/AutoDMX",
  },
} as const;

export type SocialKey = keyof typeof SOCIALS;

export type SocialIconProps = {
  network: SocialKey;
  className?: string;
};

export function SocialIcon({ network, className = "w-4 h-4" }: SocialIconProps) {
  switch (network) {
    case "instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "youtube":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.6A3 3 0 0 0 .5 7.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-4.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
        </svg>
      );
    case "x":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
        </svg>
      );
    case "github":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.475 2 2 6.485 2 12.017c0 4.419 2.865 8.166 6.84 9.49.5.09.682-.218.682-.483 0-.237-.009-.866-.014-1.7-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.111-1.466-1.111-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.338c1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.203 2.397.1 2.65.64.7 1.028 1.594 1.028 2.687 0 3.848-2.338 4.695-4.566 4.943.359.31.679.92.679 1.855 0 1.338-.012 2.418-.012 2.747 0 .268.18.578.688.48C19.138 20.18 22 16.434 22 12.017 22 6.485 17.522 2 12 2Z"
          />
        </svg>
      );
  }
}

export type SocialLinkProps = {
  network: SocialKey;
  showHandle?: boolean;
  variant?: "icon-only" | "with-handle";
  className?: string;
};

/**
 * A single clickable social link.
 */
export function SocialLink({
  network,
  variant = "icon-only",
  className = "",
}: SocialLinkProps) {
  const s = SOCIALS[network];
  const Icon = (
    <SocialIcon
      network={network}
      className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
    />
  );

  if (variant === "with-handle") {
    return (
      <a
        href={s.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${s.label} — ${s.handle}`}
        className={`group inline-flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white/80 px-4 py-3 text-sm font-medium text-neutral-800 shadow-sm transition-all hover:border-neutral-400 hover:bg-neutral-50 hover:text-black dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white ${className}`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          {Icon}
        </span>
        <span className="flex flex-col text-left leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {s.label}
          </span>
          <span className="text-sm font-medium">{s.handle}</span>
        </span>
      </a>
    );
  }

  return (
    <a
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${s.label} — ${s.handle}`}
      className={`group inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/70 bg-white text-neutral-600 transition-all hover:border-neutral-400 hover:bg-neutral-50 hover:text-black dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white ${className}`}
    >
      {Icon}
    </a>
  );
}

export type SocialLinksProps = {
  networks?: SocialKey[];
  variant?: "icon-only" | "with-handle";
  className?: string;
  itemClassName?: string;
};

/**
 * Renders a row of clickable social icons.
 */
export function SocialLinks({
  networks = ["instagram", "youtube", "x", "github"],
  variant = "icon-only",
  className = "",
  itemClassName = "",
}: SocialLinksProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      role="list"
    >
      {networks.map((n) => (
        <div role="listitem" key={n}>
          <SocialLink
            network={n}
            variant={variant}
            className={itemClassName}
          />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Brand mark                                                         */
/* ------------------------------------------------------------------ */

export type BrandMarkProps = {
  className?: string;
  withMark?: boolean;
};

/**
 * The official AutoDMX wordmark with the brand icon mark.
 * Always links back to the home page.
 */
export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center transition-opacity hover:opacity-90 ${className}`}
    >
      <AutoDMXLogo variant="horizontal" />
    </Link>
  );
}

import Link from "next/link";
import { BrandMark, SocialLinks } from "./SocialLinks";
import { ThemeToggle } from "./ThemeToggle";

/* ------------------------------------------------------------------ */
/* AppShell                                                            */
/* ------------------------------------------------------------------ */

type NavItem = { label: string; href: string; active?: boolean };

export type AppShellProps = {
  /** When true, renders the marketing nav (Home). When false, renders the dashboard nav. */
  variant: "marketing" | "dashboard";
  /** Active route for the dashboard variant. */
  activeNav?: "dashboard" | "contacts" | "analytics" | "settings";
  /** Status pill text shown on the dashboard variant. */
  statusText?: string;
  /** Optional CTA button in the top right (e.g. "Launch Dashboard" on home). */
  cta?: { label: string; href: string };
  children: React.ReactNode;
  /** Suppress the in-page footer (used by legal pages that print their own). */
  hideFooter?: boolean;
};

const dashboardNav: NavItem[] = [
  { label: "Overview", href: "/dashboard" },
  { label: "Contacts", href: "/dashboard/contacts" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Settings", href: "/dashboard/settings" },
];

function isActive(item: NavItem, current?: string) {
  if (!current) return false;
  // Overview → /dashboard (no subpath)
  if (item.href === "/dashboard") return current === "dashboard";
  return item.href.endsWith(`/${current}`);
}

/**
 * Shared chrome: top bar (brand + nav + socials + theme switcher + status),
 * then children, then an Apple-inspired minimalist footer.
 */
export function AppShell({
  variant,
  activeNav,
  statusText = "System online",
  cta,
  children,
  hideFooter = false,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafc] text-neutral-900 transition-colors duration-200 dark:bg-[#09090b] dark:text-neutral-100">
      {/* Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl dark:border-white/[0.08] dark:bg-black/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-8">
            <BrandMark />
            {variant === "dashboard" && (
              <nav className="hidden items-center gap-1 md:flex">
                {dashboardNav.map((item) => {
                  const active = isActive(item, activeNav);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                        active
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {variant === "dashboard" && (
              <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 sm:flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                {statusText}
              </div>
            )}

            <div className="hidden md:block">
              <SocialLinks />
            </div>

            {/* Dark / Light Mode Toggle */}
            <ThemeToggle />

            {variant === "marketing" && cta && (
              <Link href={cta.href} className="btn-primary">
                {cta.label}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav (dashboard only) */}
        {variant === "dashboard" && (
          <nav className="flex items-center gap-1 overflow-x-auto border-t border-black/[0.04] px-4 py-2 dark:border-white/[0.04] md:hidden">
            {dashboardNav.map((item) => {
              const active = isActive(item, activeNav);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {!hideFooter && (
        <footer className="mt-24 border-t border-black/[0.06] bg-neutral-50/50 dark:border-white/[0.08] dark:bg-neutral-950/40">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
            <div>
              <BrandMark />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                The open-source, self-hosted ManyChat alternative for Instagram comment-to-DM automation.
                Full data ownership, zero recurring subscriber fees.
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Product
              </h4>
              <ul className="mt-3.5 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-black dark:hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/contacts"
                    className="hover:text-black dark:hover:text-white transition-colors"
                  >
                    Contacts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/analytics"
                    className="hover:text-black dark:hover:text-white transition-colors"
                  >
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-black dark:hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Community
              </h4>
              <p className="mt-3.5 text-sm text-neutral-600 dark:text-neutral-400">
                Follow the build, get tutorials, and ship automations faster.
              </p>
              <div className="mt-4">
                <SocialLinks />
              </div>
            </div>
          </div>

          <div className="border-t border-black/[0.06] dark:border-white/[0.08]">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-xs text-neutral-500 sm:flex-row sm:px-8">
              <p>
                © {new Date().getFullYear()} AutoDMX · Crafted by{" "}
                <a
                  href="https://github.com/Qaxlabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white transition-colors"
                >
                  Qaxlabs
                </a>
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link
                  href="/privacy"
                  className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                >
                  Terms
                </Link>
                <Link
                  href="/data-deletion"
                  className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                >
                  Data Deletion
                </Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

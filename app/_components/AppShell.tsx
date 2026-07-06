import Link from "next/link";
import { BrandMark, SocialLinks } from "./SocialLinks";

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
 * Shared chrome: top bar (brand + nav + socials + status), then children,
 * then a slim footer. Used on every page so the app feels like one product.
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
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
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-white/[0.06] text-white"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
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
              <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-300 sm:flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {statusText}
              </div>
            )}

            <div className="hidden md:block">
              <SocialLinks />
            </div>

            {variant === "marketing" && cta && (
              <Link href={cta.href} className="btn-primary">
                {cta.label}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav (dashboard only) */}
        {variant === "dashboard" && (
          <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/5 px-3 py-2 md:hidden">
            {dashboardNav.map((item) => {
              const active = isActive(item, activeNav);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/[0.06] text-white"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
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
        <footer className="mt-24 border-t border-white/5 bg-ink-950/40">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
            <div>
              <BrandMark />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
                Self-hosted Instagram comment-to-DM automation, built for
                creators who want full control of their audience data.
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Product
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/contacts"
                    className="hover:text-white transition-colors"
                  >
                    Contacts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/analytics"
                    className="hover:text-white transition-colors"
                  >
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Community
              </h4>
              <p className="mt-4 text-sm text-slate-400">
                Follow the build, get tutorials, and ship automations faster.
              </p>
              <div className="mt-4">
                <SocialLinks />
              </div>
            </div>
          </div>

          <div className="border-t border-white/5">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:px-8">
              <p>
                © {new Date().getFullYear()} AutoDMX · Crafted by{" "}
                <a
                  href="https://github.com/Qaxlabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-300 hover:text-white"
                >
                  Qaxlabs
                </a>
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link
                  href="/privacy"
                  className="hover:text-slate-300 transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-slate-300 transition-colors"
                >
                  Terms
                </Link>
                <Link
                  href="/data-deletion"
                  className="hover:text-slate-300 transition-colors"
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

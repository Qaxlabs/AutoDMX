import Link from "next/link";
import { AppShell } from "./_components/AppShell";
import { SocialLinks, SocialLink, SocialKey } from "./_components/SocialLinks";
import { ContactEmail } from "./_components/ContactEmail";

/* ---------- Reusable building blocks used only on the home page ---------- */

function Stat({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="text-3xl font-semibold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-300">{label}</div>
      {hint && <div className="mt-2 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div className="card-lift group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-7">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full ${accent} opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div className="relative">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-brand-300">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
        Step {number}
      </div>
      <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}

const FEATURE_ICONS = {
  shield: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  bolt: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  ),
  code: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </svg>
  ),
  chart: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 4 4 5-6" />
    </svg>
  ),
  lock: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
  database: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5" />
      <path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6" />
    </svg>
  ),
};

/* --------------------------------- Page --------------------------------- */

export default function Home() {
  // The "with-handle" cards in the community section
  const communityOrder: SocialKey[] = ["instagram", "youtube", "x", "github"];

  return (
    <AppShell
      variant="marketing"
      cta={{ label: "Launch Dashboard", href: "/dashboard" }}
    >
      {/* ====================== Hero ====================== */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-32 h-[480px] bg-hero-glow"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]"
        />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-8 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Instagram comment-to-DM automation · by Qaxlabs
            </div>

            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              Turn comments into{" "}
              <span className="text-brand-gradient">conversions</span>{" "}
              <span className="block">in real time.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-slate-400 sm:text-lg">
              AutoDMX is the self-hosted Instagram automation platform built for
              creators who care about ownership. Capture leads, deliver links,
              and gate content — all from your own database.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/dashboard" className="btn-primary px-6 py-3.5 text-base">
                Open the dashboard
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <a
                href="https://github.com/Qaxlabs/AutoDMX"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-6 py-3.5 text-base"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.475 2 2 6.485 2 12.017c0 4.419 2.865 8.166 6.84 9.49.5.09.682-.218.682-.483 0-.237-.009-.866-.014-1.7-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.111-1.466-1.111-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.338c1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.203 2.397.1 2.65.64.7 1.028 1.594 1.028 2.687 0 3.848-2.338 4.695-4.566 4.943.359.31.679.92.679 1.855 0 1.338-.012 2.418-.012 2.747 0 .268.18.578.688.48C19.138 20.18 22 16.434 22 12.017 22 6.485 17.522 2 12 2Z" />
                </svg>
                Star on GitHub
              </a>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              MIT open-source license · v0.1.0
            </p>
          </div>

          {/* Mock product preview */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-brand-500/30 via-accent-500/20 to-cyan-400/20 opacity-60 blur-2xl" />
            <div className="glass-strong relative overflow-hidden rounded-3xl p-1.5 shadow-2xl">
              <div className="rounded-[20px] border border-white/5 bg-ink-900/80 p-5">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  </div>
                  <div className="ml-3 flex-1 text-center text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    autodmx · dashboard
                  </div>
                  <div className="h-2.5 w-12 rounded-full bg-white/5" />
                </div>

                <div className="grid gap-3 pt-5 sm:grid-cols-3">
                  <Stat
                    value="2,184"
                    label="Comments captured"
                    hint="Last 30 days"
                  />
                  <Stat
                    value="74%"
                    label="Follow pass rate"
                    hint="AutoDMX avg."
                  />
                  <Stat value="1.2k" label="DMs delivered" hint="Across 6 posts" />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { name: "Reel — Hook strategy", active: true },
                    { name: "Post — Free guide drop", active: true },
                    { name: "Carousel — Lead magnet", active: false },
                    { name: "Reel — CTA follow", active: true },
                    { name: "Post — Promo", active: false },
                    { name: "Story reply flow", active: true },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                    >
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-500/40 to-accent-500/30 ring-1 ring-white/5" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-white">
                          {p.name}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              p.active
                                ? "bg-emerald-400"
                                : "bg-slate-500"
                            }`}
                          />
                          <span
                            className={
                              p.active ? "text-emerald-300" : "text-slate-500"
                            }
                          >
                            {p.active ? "Active" : "Paused"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== Logos / proof bar ====================== */}
      <section className="border-y border-white/5 bg-white/[0.015] py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Built for creators who self-host · Powered by Next.js · Supabase · Meta Graph API
          </p>
        </div>
      </section>

      {/* ====================== Features ====================== */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-300">
            What&apos;s inside
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything you need to run a real automation layer.
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Not a Zapier clone. A purpose-built platform that respects Meta&apos;s
            guardrails, your data, and your time.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={FEATURE_ICONS.bolt}
            title="Instant comment-to-DM"
            body="Trigger keyword-matched automations the moment a comment lands. Public reply + private DM in under a second."
            accent="bg-brand-500/30"
          />
          <FeatureCard
            icon={FEATURE_ICONS.lock}
            title="AES-256 token encryption"
            body="Instagram access tokens are encrypted at rest with AES-256-GCM before any database write."
            accent="bg-accent-500/30"
          />
          <FeatureCard
            icon={FEATURE_ICONS.database}
            title="You own the data"
            body="Every lead, message, and event lives in your own Supabase Postgres. Export to CSV, query it, move it — your call."
            accent="bg-cyan-400/30"
          />
          <FeatureCard
            icon={FEATURE_ICONS.shield}
            title="Meta API guardrails"
            body="Database-enforced rate limiting keeps you under Meta's hourly + daily limits so your account stays healthy."
            accent="bg-emerald-500/30"
          />
          <FeatureCard
            icon={FEATURE_ICONS.code}
            title="Self-hosted by design"
            body="Deploy on Netlify + scheduled functions or any Node host. No Redis, no SaaS lock-in, no surprise billing."
            accent="bg-amber-400/30"
          />
          <FeatureCard
            icon={FEATURE_ICONS.chart}
            title="Built-in analytics"
            body="See comment volume, follow pass rates, DM delivery, and link clicks per automation — all in one dashboard."
            accent="bg-rose-500/30"
          />
        </div>
      </section>

      {/* ====================== How it works ====================== */}
      <section className="border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-300">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Live in three steps.
            </h2>
            <p className="mt-4 text-base text-slate-400">
              From Meta credentials to your first conversion in less than 10
              minutes.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <Step
              number="01"
              title="Connect Instagram"
              body="Drop your Meta App credentials into .env.local. The first account initializes itself on next page load."
            />
            <Step
              number="02"
              title="Pick a post, set a rule"
              body="Open any post or reel in the dashboard, write your keyword, public reply, and the DM you want delivered."
            />
            <Step
              number="03"
              title="Watch conversions roll in"
              body="Comments get tracked, follow checks run in the background, and the analytics tab tells you what's working."
            />
          </div>
        </div>
      </section>

      {/* ====================== Community / socials ====================== */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid items-center gap-12 rounded-3xl border border-white/5 bg-white/[0.02] p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-300">
              Built by Qaxlabs
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Follow the build.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-400">
              Tutorials, behind-the-scenes product breakdowns, and the occasional
              meme — across Instagram, YouTube, and X. Open an issue on GitHub if
              you want to ship something with us.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {communityOrder.map((n) => (
                <SocialLink key={n} network={n} variant="with-handle" />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 blur-2xl" />
            <div className="glass-strong relative rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Latest from the team
                </div>
                <span className="h-2 w-2 animate-pulse-soft rounded-full bg-emerald-400" />
              </div>
              <ul className="mt-4 divide-y divide-white/5 text-sm">
                <li className="flex items-start gap-3 py-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.04] text-slate-300">
                    <SocialLinks />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      Building a real-time DM funnel
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      New video on YouTube · 2 days ago
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 py-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.04] text-slate-300">
                    <SocialLinks networks={["github"]} />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      v0.1.0 release notes
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      AutoDMX is now self-hostable · GitHub
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 py-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.04] text-slate-300">
                    <SocialLinks networks={["instagram"]} />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      Behind the scenes of the comment engine
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Reel on Instagram · this week
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== Final CTA ====================== */}
      <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-brand-500/15 via-ink-900 to-ink-900 p-10 text-center sm:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-brand-500/30 blur-3xl"
          />
          <h2 className="relative text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to ship your first automation?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base text-slate-300">
            Connect your Instagram, pick a post, and have your first DM
            delivered in under 10 minutes.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard" className="btn-primary px-6 py-3.5 text-base">
              Launch the dashboard
            </Link>
            <ContactEmail className="btn-secondary px-6 py-3.5 text-base" />
          </div>
        </div>
      </section>
    </AppShell>
  );
}

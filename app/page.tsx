import Link from "next/link";
import { AppShell } from "./_components/AppShell";
import { SocialLink, SocialIcon, SocialKey } from "./_components/SocialLinks";
import { ContactEmail } from "./_components/ContactEmail";
import {
  Zap,
  ShieldCheck,
  Database,
  Sliders,
  Server,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

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
    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-neutral-600 dark:text-neutral-300">
        {label}
      </div>
      {hint && (
        <div className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
          {hint}
        </div>
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-700 dark:hover:shadow-2xl">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {body}
      </p>
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
    <div className="relative rounded-2xl border border-neutral-200/80 bg-white p-7 shadow-sm transition-all duration-200 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-700">
      <div className="text-xs font-mono font-medium tracking-wider text-neutral-400 dark:text-neutral-500">
        STEP {number}
      </div>
      <h3 className="mt-3 text-base font-semibold text-neutral-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {body}
      </p>
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function Home() {
  const communityOrder: SocialKey[] = ["instagram", "youtube", "x", "github"];

  return (
    <AppShell
      variant="marketing"
      cta={{ label: "Launch Dashboard", href: "/dashboard" }}
    >
      {/* ====================== Hero ====================== */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3.5 py-1 text-xs font-medium text-neutral-700 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Instagram comment-to-DM automation · by Qaxlabs
            </div>

            {/* Apple Style Headline */}
            <h1 className="mt-7 text-balance text-4xl font-semibold tracking-tight text-neutral-900 sm:text-6xl sm:leading-[1.1] dark:text-white">
              Turn comments into conversions{" "}
              <span className="text-neutral-500 dark:text-neutral-400">in real time.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400">
              AutoDMX is the self-hosted Instagram automation platform built for
              creators who care about ownership. Capture leads, deliver links,
              and gate content — all from your own database.
            </p>

            {/* CTA Row */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/dashboard" className="btn-primary px-6 py-3 text-sm">
                Open the dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/Qaxlabs/AutoDMX"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-6 py-3 text-sm"
              >
                <SocialIcon network="github" className="h-4 w-4" />
                Star on GitHub
              </a>
            </div>

            <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
              MIT open-source license · v0.1.0 · Self-hosted with Supabase
            </p>
          </div>

          {/* Minimalist Dashboard Preview Mockup */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-xl dark:border-neutral-800 dark:bg-[#121214] dark:shadow-2xl">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-neutral-200/80 bg-neutral-50/80 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/80">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                </div>
                <div className="text-[11px] font-mono font-medium text-neutral-400 dark:text-neutral-500">
                  autodmx.app/dashboard
                </div>
                <div className="h-2.5 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              </div>

              {/* Window Content */}
              <div className="p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Stat
                    value="2,184"
                    label="Comments captured"
                    hint="Last 30 days"
                  />
                  <Stat
                    value="74%"
                    label="Follow pass rate"
                    hint="AutoDMX verified"
                  />
                  <Stat
                    value="1.2k"
                    label="DMs delivered"
                    hint="Across 6 active posts"
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { name: "Reel — Hook strategy", active: true, tag: "REEL" },
                    { name: "Post — Free guide drop", active: true, tag: "POST" },
                    { name: "Carousel — Lead magnet", active: false, tag: "CAROUSEL" },
                    { name: "Reel — CTA follow", active: true, tag: "REEL" },
                    { name: "Post — Promo launch", active: false, tag: "POST" },
                    { name: "Story reply flow", active: true, tag: "REEL" },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/40"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-200/80 font-mono text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        {p.tag}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
                          {p.name}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              p.active ? "bg-emerald-500" : "bg-neutral-400"
                            }`}
                          />
                          <span
                            className={
                              p.active
                                ? "text-emerald-700 font-medium dark:text-emerald-400"
                                : "text-neutral-500 dark:text-neutral-500"
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
      <section className="border-y border-neutral-200/80 bg-neutral-50/60 py-8 dark:border-neutral-800/80 dark:bg-neutral-950/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-center text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            Built for creators who self-host · Next.js · Supabase · Meta Graph API
          </p>
        </div>
      </section>

      {/* ====================== Features ====================== */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            FEATURES
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Everything you need to run a real automation layer.
          </h2>
          <p className="mt-3.5 text-base text-neutral-600 dark:text-neutral-400">
            A purpose-built, privacy-focused automation platform that respects Meta&apos;s
            guardrails, your data, and your time.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Instant comment-to-DM"
            body="Trigger keyword-matched automations the moment a comment lands. Public reply + private DM in under a second."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="AES-256 token encryption"
            body="Instagram access tokens are encrypted at rest with AES-256-GCM before any database write."
          />
          <FeatureCard
            icon={<Database className="h-5 w-5" />}
            title="You own the data"
            body="Every lead, message, and event lives in your own Supabase Postgres. Export to CSV, query it, move it — your call."
          />
          <FeatureCard
            icon={<Sliders className="h-5 w-5" />}
            title="Meta API guardrails"
            body="Database-enforced rate limiting keeps you under Meta's hourly and daily limits so your account stays healthy."
          />
          <FeatureCard
            icon={<Server className="h-5 w-5" />}
            title="Self-hosted by design"
            body="Deploy on Netlify, Vercel, or any Node host with scheduled cron functions. No Redis or recurring SaaS fee."
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Built-in analytics"
            body="See comment volume, follow pass rates, DM delivery, and link clicks per automation — all in one clean view."
          />
        </div>
      </section>

      {/* ====================== How it works ====================== */}
      <section className="border-y border-neutral-200/80 bg-neutral-50/60 py-24 dark:border-neutral-800/80 dark:bg-neutral-950/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              WORKFLOW
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
              Live in three steps.
            </h2>
            <p className="mt-3.5 text-base text-neutral-600 dark:text-neutral-400">
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
        <div className="grid items-center gap-10 rounded-3xl border border-neutral-200/80 bg-white p-8 shadow-sm sm:p-12 lg:grid-cols-2 dark:border-neutral-800 dark:bg-neutral-900/60">
          <div>
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              BUILT BY QAXLABS
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
              Follow the build.
            </h2>
            <p className="mt-3.5 max-w-lg text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
              Tutorials, behind-the-scenes product breakdowns, and open-source updates
              across Instagram, YouTube, and X. Open an issue on GitHub if
              you want to contribute.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {communityOrder.map((n) => (
                <SocialLink key={n} network={n} variant="with-handle" />
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-6 dark:border-neutral-800 dark:bg-neutral-950/60">
              <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4 dark:border-neutral-800">
                <div className="text-xs font-mono font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                  Latest from the team
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <ul className="mt-4 divide-y divide-neutral-200/70 text-sm dark:divide-neutral-800">
                <li className="flex items-start gap-3 py-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      Building a real-time DM funnel
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      New video on YouTube · by Qaxlabs
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 py-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      v0.1.0 release notes
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      AutoDMX is now self-hostable · GitHub
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 py-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      Behind the scenes of the comment engine
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
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
        <div className="rounded-3xl border border-neutral-200/90 bg-white p-10 text-center shadow-sm sm:p-16 dark:border-neutral-800 dark:bg-neutral-900/60">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Ready to ship your first automation?
          </h2>
          <p className="mx-auto mt-3.5 max-w-xl text-base text-neutral-600 dark:text-neutral-400">
            Connect your Instagram, pick a post, and have your first automated
            DM delivered in under 10 minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard" className="btn-primary px-6 py-3.5 text-sm">
              Launch the dashboard
            </Link>
            <ContactEmail className="btn-secondary px-6 py-3.5 text-sm" />
          </div>
        </div>
      </section>
    </AppShell>
  );
}

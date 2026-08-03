rr# 🗺️ Roadmap

This is a high-level, community-driven roadmap for AutoDMX. It is **not a commitment** — priorities shift based on user feedback, contributions, and ecosystem changes. Items move between sections as work progresses.

Want to influence the roadmap? Open a [feature request](https://github.com/Qaxlabs/AutoDMX/issues/new?template=feature_request.md), comment on existing issues, or [contribute code](./CONTRIBUTING.md).

---

## ✅ Released

See the [CHANGELOG.md](./CHANGELOG.md) for the full list.

- Instagram comment-to-DM automation engine
- Webhook listener with Meta Graph API integration
- Webhook deduplication
- Rate-limited send queue with database-level guardrails
- Link tracking and click analytics
- Follow-gating step
- Public reply variants (A/B testing)
- Cron drain endpoint + GitHub Actions workflow
- Password-protected dashboard
- AES-256-GCM token encryption
- Privacy, Terms, and Data Deletion pages

---

## 🚧 In Progress

- Improved dashboard analytics (charts, conversion funnels)
- Multi-account support refinements
- Test coverage for the webhook and queue drain flows

---

## 🔮 Planned

### Core platform

- [ ] **Multi-user authentication** — Replace the single-password dashboard gate with Supabase Auth, per-user accounts, role-based access
- [ ] **PostgreSQL migrations runner** — A documented one-command bootstrap for fresh Supabase projects
- [ ] **Observability** — Structured logging, optional OpenTelemetry export, error tracking (Sentry) integration
- [ ] **Internationalization (i18n)** — Translatable UI strings, RTL support
- [ ] **Rate-limit visibility** — Real-time dashboard widget showing remaining Meta API budget

### Automation features

- [ ] **Trigger conditions** — Multiple keywords, regex matching, media-type filters
- [ ] **Multi-step DM sequences** — Send a follow-up message after N days if no reply
- [ ] **Conditional branches** — Route users based on their response or profile
- [ ] **Auto-unfollow recovery** — Detect when a user unfollows and revoke access to delivered links
- [ ] **Story reply automation** — Trigger on story replies, not just comments
- [ ] **Reel automation** — Detect reel mentions, comments, and stickers
- [ ] **Live comment automation** — Trigger during Instagram Live

### Integrations

- [ ] **Webhook subscriptions** — Allow third parties to receive automation events
- [ ] **CRM sync** — Push contacts to HubSpot, Notion, Airtable, etc.
- [ ] **Email capture** — Collect emails in DM flows and pipe to Mailchimp / ConvertKit / Resend audiences
- [ ] **Telegram & Discord bridges** — Mirror automations to other channels
- [ ] **Zapier / Make / n8n** — Public REST API for "no-code" integrations

### Developer experience

- [ ] **End-to-end tests** with Playwright
- [ ] **Public REST API** with OpenAPI spec
- [ ] **CLI tool** for managing automations from the terminal
- [ ] **Docker image** for one-command self-hosting
- [ ] **Helm chart** for Kubernetes deployments
- [ ] **One-click deploy buttons** for Netlify, Vercel, Render, Railway, Fly.io

### Operations

- [ ] **Backups & restore** — Documented Supabase backup / restore workflow
- [ ] **Health-check endpoint** — `/api/health` for uptime monitoring
- [ ] **Status page** — public status.autoDMX.dev (or self-hosted equivalent)
- [ ] **Audit log** — Track every change to automations and accounts

### Compliance

- [ ] **GDPR data export** — Self-service user data export endpoint
- [ ] **Consent management** — Opt-in/opt-out flow for contactable users
- [ ] **Region-aware message templates** — Detect user locale and adjust wording

---

## 💭 Considering

These ideas are on our radar but uncommitted. Weigh in via [Discussions](https://github.com/Qaxlabs/AutoDMX/discussions) if you have opinions.

- AI-generated reply variants (LLM-spun A/B copy)
- Subscription / billing for hosted AutoDMX-as-a-Service
- A pluggable "platform" abstraction to support TikTok, X, YouTube Shorts
- Onchain identity verification for gated DM flows
- Web push / browser notifications for automations

---

## 🛑 Out of Scope (for now)

To keep AutoDMX focused, the following are intentionally **not** on the roadmap:

- General social media scheduling (AutoDMX is a comment-to-DM platform, not a scheduler)
- Content creation / AI caption generation
- Influencer marketplace / paid promotion
- Account purchasing or growth-hacking features that violate Meta's TOS

If you have a use case that feels like a fit, [start a discussion](https://github.com/Qaxlabs/AutoDMX/discussions) — we're listening.

---

## 📅 Release Cadence

We aim for:

- **Patch releases** — as needed for security or critical bug fixes
- **Minor releases** — every 4–6 weeks with a curated batch of features
- **Major releases** — when there are breaking API or schema changes

---

## 🙋 Help Wanted

Want to work on something from this roadmap? Look for issues tagged [`good first issue`](https://github.com/Qaxlabs/AutoDMX/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or [`help wanted`](https://github.com/Qaxlabs/AutoDMX/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22), and don't hesitate to ask for guidance in the comments.

---

<div align="center">

This roadmap is a living document. Last updated July 2026.

</div>

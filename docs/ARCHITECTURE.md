# Architecture

> High-level overview of how AutoDMX is structured. For setup and usage, see the [README](../README.md).

## 🎯 Goals

- **Self-hostable** — anyone can run it on Netlify, Vercel, or any Node.js host.
- **Serverless-friendly** — no long-lived worker process; scheduled jobs trigger queue draining.
- **Meta-compliant** — respects Instagram's published rate limits and platform policies.
- **Secure by default** — encrypts tokens at rest, gates sensitive endpoints, and verifies webhook signatures.

## 🧱 Components

```
┌──────────────────────────────────────────────────────────────────┐
│                              Client                              │
│  (Browser → /, /dashboard, /login, /privacy, /terms, /data-…)    │
└──────────────┬──────────────────────────────────────┬─────────────┘
               │ HTTPS                              │ HTTPS
               ▼                                    ▼
┌──────────────────────────────┐    ┌────────────────────────────────┐
│       Next.js (App Router)   │    │   Meta Graph API / Webhooks    │
│  - Server components         │◄──►│   - Instagram platform          │
│  - Route handlers            │    │   - Webhook delivery           │
│  - Middleware (auth gate)    │    └────────────────────────────────┘
└──────────┬───────────────────┘
           │
           │ supabase-js (server + browser)
           ▼
┌──────────────────────────────┐    ┌────────────────────────────────┐
│        Supabase (Postgres)   │    │  GitHub Actions / cron          │
│  - accounts, automations     │    │  - Triggers /api/cron every 10m│
│  - contacts, conversations   │    └──────────┬─────────────────────┘
│  - send_queue (rate-limited) │               │
│  - analytics, link_clicks    │               ▼
│  - processed_comments        │    ┌────────────────────────────────┐
└──────────────────────────────┘    │  /api/cron/drain-queue         │
                                    │  - Drains pending DMs          │
                                    │  - Respects rate limits        │
                                    │  - Calls lib/instagram.ts      │
                                    └────────────────────────────────┘
```

## 📂 Code Layout

```
AutoDMX/
├── app/                       # Next.js App Router
│   ├── page.tsx               # Landing page
│   ├── layout.tsx             # Root layout
│   ├── dashboard/             # Authenticated dashboard
│   │   ├── page.tsx
│   │   ├── DashboardGrid.tsx
│   │   ├── AutomationSlideOver.tsx
│   │   ├── actions.ts         # Server actions
│   │   ├── analytics/         # Analytics pages
│   │   ├── contacts/          # Contacts pages
│   │   └── settings/          # Settings pages
│   ├── api/
│   │   ├── webhook/           # Meta webhook entry point
│   │   └── cron/              # Queue drain endpoint
│   ├── login/                 # Dashboard password gate
│   ├── privacy/               # Privacy policy
│   ├── terms/                 # Terms of service
│   └── data-deletion/         # Meta data deletion callback
│
├── lib/                       # Shared server-side modules
│   ├── crypto.ts              # AES-256-GCM helpers
│   ├── instagram.ts           # Meta Graph API client + queue logic
│   └── supabase.ts            # Supabase client factory
│
├── utils/                     # Reusable utilities
│   └── supabase/              # Server-side Supabase helpers
│
├── supabase/
│   └── migrations/            # SQL migrations (apply in order)
│
├── middleware.ts              # Dashboard password gate
├── next.config.mjs            # Next.js config
├── tailwind.config.ts         # Tailwind config
├── tsconfig.json              # TypeScript config
├── .env.example               # Environment variable template
└── .github/
    └── workflows/
        └── cron.yml           # Scheduled queue drain
```

## 🔁 Request Flows

### 1. Webhook → Send Queue

1. Meta POSTs a comment event to `/api/webhook`.
2. The handler verifies the `X-Hub-Signature-256` header using `META_APP_SECRET`.
3. It deduplicates using the event ID (see `processed_comments`).
4. It looks up matching automations and inserts a row into `send_queue`.
5. Returns `200 OK` to Meta immediately (Meta expects < 5s).

### 2. Cron → Drain Queue

1. GitHub Actions hits `/api/cron/drain-queue` every 10 minutes with `CRON_SECRET` as a bearer token.
2. The handler pulls pending rows from `send_queue`, ordered by `next_attempt_at`, limited by per-account rate caps.
3. For each row, it calls `lib/instagram.ts` which:
   - Decrypts the access token (AES-256-GCM)
   - Optionally checks whether the user follows the account
   - Sends the DM via the Meta Graph API
   - On 429, defers the row with exponential backoff
   - On success, marks the row sent and writes analytics

### 3. Dashboard → Server Action

1. The user edits an automation in the dashboard.
2. The form posts to a server action in `app/dashboard/actions.ts`.
3. The action validates input, writes to Supabase, and revalidates the page.

## 🗄️ Database Schema (high level)

Tables in `supabase/migrations/`:

| Table | Purpose |
| --- | --- |
| `accounts` | Connected Instagram accounts (tokens encrypted) |
| `automations` | Trigger rules, message templates, links, follow requirements |
| `contacts` | Users who have interacted with automations |
| `conversations` | State machine for ongoing DM threads |
| `send_queue` | Rate-limited queue of pending DM sends |
| `processed_comments` | Webhook deduplication log |
| `analytics_events` | Aggregated event tracking |
| `link_clicks` | Per-link click tracking |

> See the SQL files for exact columns, indexes, and RLS policies.

## 🔐 Security Model

- **Encryption at rest** — Instagram access tokens are stored as `iv:authTag:ciphertext` strings, encrypted with AES-256-GCM using a key derived from `ENCRYPTION_KEY`.
- **Webhook verification** — All inbound webhook requests are verified via `X-Hub-Signature-256` HMAC.
- **Cron auth** — `/api/cron/drain-queue` requires a bearer token (`CRON_SECRET`).
- **Dashboard auth** — `middleware.ts` gates `/dashboard` with `DASHBOARD_PASSWORD`.
- **Row Level Security** — Supabase RLS is enabled on user-data tables.
- **No token in the browser** — Decrypted tokens are used only in server-side handlers.

## 📈 Scaling Considerations

The current architecture is intentionally simple:

- **Single-region Supabase** is sufficient for thousands of accounts.
- **Drain rate** is bounded by Meta's published limits (~200 DMs/hour/account for most accounts), so the queue rarely grows large.
- **Cold starts** are acceptable for the cron workflow because Meta expects webhook 200s within seconds, not minutes.

If you outgrow this:

- Move from a 10-minute cron to a continuously running worker.
- Add a Redis-backed queue alongside the database queue.
- Add multi-region read replicas for the dashboard.
- Implement a dead-letter queue for permanently failed sends.

---

## 🧪 Testing

This repository is currently light on automated tests. **Contributions welcome** — see the [Roadmap](../ROADMAP.md) and [Contributing Guide](../CONTRIBUTING.md). The most valuable places to add tests first:

- `lib/instagram.ts` — rate-limit logic, follow-check, decryption
- `app/api/webhook/` — signature verification, deduplication
- `app/api/cron/drain-queue` — queue ordering, backoff

---

<div align="center">

Built with ❤️ by [Qaxlabs](https://github.com/Qaxlabs) and contributors.

</div>

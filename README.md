<div align="center">

<img src="./public/logo.svg" alt="AutoDMX — Automate. Engage. Convert." width="360" />

<br />

# AutoDMX

### Turn Instagram Comments into Conversions — Instantly.

> **Self-hosted, open-source Instagram comment-to-DM automation.**
> Watch your Instagram posts for trigger keywords, auto-reply with a personalized DM, and
> deliver links, lead magnets, or call-to-actions — built with **Next.js 14**, **TypeScript**, and **Supabase**.

<!--
Repo metadata (helps GitHub, Google, Bing, Brave, DuckDuckGo, and AI search index this README):

name: AutoDMX
description: Self-hosted, open-source Instagram comment-to-DM automation. Capture leads, deliver links, and grow sales — straight from your comments.
homepage: https://autodmx.netlify.app
topics: instagram-automation, instagram-bot, comment-to-dm, instagram-dm, auto-reply, lead-generation, instagram-marketing, social-media-automation, meta-graph-api, manychat-alternative, self-hosted, open-source, nextjs, typescript, supabase, tailwindcss, webhooks
-->

<p align="center">
  <a href="https://github.com/Qaxlabs/AutoDMX/stargazers"><img src="https://img.shields.io/github/stars/Qaxlabs/AutoDMX?style=social" alt="GitHub stars" /></a>
  <a href="https://github.com/Qaxlabs/AutoDMX/network/members"><img src="https://img.shields.io/github/forks/Qaxlabs/AutoDMX?style=social" alt="GitHub forks" /></a>
  <a href="https://github.com/Qaxlabs/AutoDMX/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://github.com/Qaxlabs/AutoDMX/issues"><img src="https://img.shields.io/github/issues/Qaxlabs/AutoDMX" alt="Open issues" /></a>
  <a href="https://github.com/Qaxlabs/AutoDMX/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Meta-Graph_API-1877F2?logo=meta&logoColor=white" alt="Meta Graph API" />
</p>

<p align="center">
  <a href="https://autodmx.qaxlabs.com"><strong>Website</strong></a> ·
  <a href="https://autodmx.qaxlabs.com/docs"><strong>Docs</strong></a> ·
  <a href="#-demo"><strong>Demo</strong></a> ·
  <a href="#-quick-start"><strong>Quick Start</strong></a> ·
  <a href="https://github.com/Qaxlabs/AutoDMX/discussions"><strong>Discussions</strong></a>
</p>

Built by **[Qaxlabs](https://github.com/Qaxlabs)** ·
[Instagram](https://instagram.com/qaxlabs) ·
[YouTube](https://www.youtube.com/@Qaxlabs) ·
[X](https://x.com/qaxlabs)

</div>

---

## 🔎 What is AutoDMX?

**AutoDMX** is an open-source, self-hosted **Instagram automation platform** that turns public Instagram comments into private DMs. Use it to:

- 🤖 Auto-reply to comments with **keyword triggers** (`"PRICE"`, `"LINK"`, `"INFO"` …)
- 📩 Send **personalized DMs** with links, lead magnets, coupons, or PDFs
- 📈 Track **click-throughs and conversions** in a built-in dashboard
- 🛡️ Stay compliant with **Meta rate limits** (rate-limiting enforced at the database level)
- 🔁 Optionally **gate DMs behind a follow** to grow your audience

It is the **ManyChat / IGdm alternative you can self-host** — no monthly fee, no vendor lock-in, full data ownership.

---

## ✨ Features

- 🎯 **Comment-to-DM Automation** — Automatically reply to comments on your posts with a personalized DM containing links, lead magnets, or call-to-actions.
- 🔐 **AES-256-GCM Encryption** — Instagram access tokens are encrypted at rest before database writes, keeping credentials fully secure.
- 🏠 **Self-Hosted & Serverless** — Runs on Next.js with GitHub Actions for scheduled tasks. No heavy Redis or worker servers required.
- 📊 **Built-in Analytics** — Track link clicks, follow-throughs, and conversion performance from the dashboard.
- 🛡️ **Meta API Guardrails** — Rate limiting enforced at the database level. Respects Meta's published limits out-of-the-box to keep your Instagram accounts active.
- 🔁 **Follow-Gating** — Optionally require users to follow your account before receiving the DM, with a custom follow-prompt message.
- 🧪 **Public Reply Variants** — A/B test multiple reply messages to optimize engagement.
- 🧹 **Webhook Deduplication** — Prevents duplicate DM sends when Meta re-delivers webhook events.
- 🔒 **Dashboard Password Protection** — Single-password gate keeps your automation controls private.
- 📥 **Data Deletion Endpoint** — Compliant with Meta's data deletion callback requirements.

---

## 🖼️ Demo

Watch the full walkthrough on YouTube:

<p align="center">
  <a href="https://www.youtube.com/watch?v=Yu7mTyr_rkU" target="_blank" rel="noopener">
    <img
      src="https://i.ytimg.com/vi/Yu7mTyr_rkU/maxresdefault.jpg"
      alt="AutoDMX — Demo Walkthrough"
      width="720"
      style="border-radius:12px;border:1px solid #e4e4e7;"
    />
  </a>
</p>

<p align="center">
  <a href="https://www.youtube.com/watch?v=Yu7mTyr_rkU" target="_blank" rel="noopener">
    <strong>▶ Watch on YouTube</strong>
  </a>
  &nbsp;·&nbsp;
  <a href="https://youtu.be/Yu7mTyr_rkU" target="_blank" rel="noopener">Short link</a>
</p>

The dashboard provides a clean interface to:

- View your connected Instagram accounts and recent posts
- Create and edit automations (trigger keyword, DM message, links, follow requirement)
- Inspect contacts, conversations, and analytics
- Manage link tracking and click performance



---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm** (or yarn / pnpm / bun)
- A **Supabase** project (free tier works) — [Create one](https://supabase.com/)
- A **Meta Developer App** with Instagram Graph API access — [Set one up](https://developers.facebook.com/apps/)
- A **Netlify** (or any Node.js host) account to deploy, or run locally for development

### 1. Clone the repository

```bash
git clone https://github.com/Qaxlabs/AutoDMX.git
cd AutoDMX
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

See [`.env.example`](./.env.example) for the full list. You'll need:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-safe) |
| `ENCRYPTION_KEY` | A 32+ character random string used to encrypt Instagram tokens |
| `META_VERIFY_TOKEN` | A random string you set, used to verify the Instagram webhook |
| `META_APP_SECRET` | Your Meta app's secret |
| `META_APP_ID` | Your Meta app ID |
| `META_INITIAL_ACCESS_TOKEN` | A long-lived Meta user access token |
| `CRON_SECRET` | Random secret used to authorize the cron endpoint |
| `DASHBOARD_PASSWORD` | Password to gate the dashboard |

> ⚠️ **Never commit your `.env.local` file.** It's already covered by `.gitignore`.

### 4. Run database migrations

Apply the SQL files in `supabase/migrations/` to your Supabase project. The easiest way is via the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase db push
```

Or copy/paste the SQL manually via the Supabase dashboard's SQL editor.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page, or [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the automation dashboard.

### 6. Configure the Meta webhook

In your Meta App dashboard, set the webhook callback URL to:

```
https://your-domain.com/api/webhook
```

Subscribe to the following fields:

- `comments` — to receive comment events
- `messages` — to receive DM events (optional)

Use the same `META_VERIFY_TOKEN` value for webhook verification.

---

## 🏗️ Architecture

```
┌─────────────────┐    webhook     ┌──────────────────┐
│  Instagram API  │ ─────────────► │  /api/webhook    │
└─────────────────┘                └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │  lib/instagram   │
                                   │  (queue + send)  │
                                   └────────┬─────────┘
                                            │
                            ┌───────────────┼───────────────┐
                            ▼               ▼               ▼
                      ┌──────────┐   ┌──────────┐   ┌──────────────┐
                      │ Supabase │   │  Meta    │   │ GitHub       │
                      │ (data)   │   │  Graph   │   │ Actions cron │
                      └──────────┘   └──────────┘   └──────────────┘
```

- **`app/`** — Next.js App Router pages and API routes
- **`lib/`** — Core automation logic, encryption, Supabase client
- **`utils/`** — Server-side Supabase helpers
- **`supabase/migrations/`** — Database schema, applied in order
- **`.github/workflows/`** — Scheduled cron job that drains the send queue
- **`middleware.ts`** — Dashboard password gate

---

## 📚 Documentation

- **[Quick Start](#-quick-start)** — Get up and running in 5 minutes
- **[Contributing Guide](./CONTRIBUTING.md)** — How to contribute code, report bugs, and suggest features
- **[Code of Conduct](./CODE_OF_CONDUCT.md)** — Community guidelines
- **[Security Policy](./SECURITY.md)** — How to report vulnerabilities
- **[Changelog](./CHANGELOG.md)** — Release history
- **[License (MIT)](./LICENSE)** — Open-source terms

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. **Any contribution you make is greatly appreciated.**

Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for details on our code of conduct, the process for submitting pull requests, and the development setup.

### Good first issues

- 🐛 Bug reports — [open an issue](https://github.com/Qaxlabs/AutoDMX/issues/new?template=bug_report.md)
- 💡 Feature requests — [open an issue](https://github.com/Qaxlabs/AutoDMX/issues/new?template=feature_request.md)
- 📖 Documentation improvements
- 🧪 Tests
- 🌍 Translations

---

## 🔒 Security

AutoDMX takes security seriously. **Do not file public issues for security vulnerabilities.** Please read our [`SECURITY.md`](./SECURITY.md) for responsible disclosure guidelines.

All Instagram access tokens are encrypted at rest using **AES-256-GCM** with a key derived from your `ENCRYPTION_KEY` environment variable. See `lib/crypto.ts` for the implementation.

---

## 🪪 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for the full text.

In short: AutoDMX is free and open-source software. You are free to use, modify, distribute, and sublicense it for personal, educational, or commercial purposes.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — The React framework
- [Supabase](https://supabase.com/) — Postgres + Auth + Realtime
- [Meta Graph API](https://developers.facebook.com/docs/instagram-api/) — Instagram platform
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Vercel](https://vercel.com/) — Hosting inspiration
- All the [contributors](https://github.com/Qaxlabs/AutoDMX/graphs/contributors) who make this project better

---

## 📞 Support & Community

- 🐛 **Bug reports & features:** [GitHub Issues](https://github.com/Qaxlabs/AutoDMX/issues)
- 💬 **Questions & discussion:** [GitHub Discussions](https://github.com/Qaxlabs/AutoDMX/discussions)
- 📖 **Documentation:** [README](./README.md) and inline code comments

---

## 🔍 Topics / Keywords

`instagram-automation` · `instagram-bot` · `comment-to-dm` · `instagram-dm` · `auto-reply` ·
`lead-generation` · `instagram-marketing` · `social-media-automation` · `meta-graph-api` ·
`manychat-alternative` · `self-hosted` · `open-source` · `nextjs` · `typescript` ·
`supabase` · `tailwindcss` · `webhooks`

---

## 🌟 Show your support

If AutoDMX saved you a subscription fee or made your launch smoother — **give it a ⭐** at the top of this page. Stars are how GitHub (and Google) decide a repo is worth showing to other developers, so it really helps.

---

## 📈 Why developers pick AutoDMX

| | AutoDMX | ManyChat | IGdm Pro |
| --- | :---: | :---: | :---: |
| Self-hosted / data ownership | ✅ | ❌ | ❌ |
| Open source (MIT) | ✅ | ❌ | ❌ |
| Meta-compliant rate limiting | ✅ | ✅ | ⚠️ |
| Built-in click & conversion analytics | ✅ | 💲 | ❌ |
| One-time deploy on free tiers | ✅ | ❌ | ❌ |

---

<div align="center">

**Built with ❤️ by [Qaxlabs](https://github.com/Qaxlabs) and contributors.**

⭐ **Star this repo** if AutoDMX helped you — it motivates us to keep building!

</div>

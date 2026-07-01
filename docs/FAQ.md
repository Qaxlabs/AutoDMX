# Frequently Asked Questions

---

## General

### What is AutoDMX?

AutoDMX is an **open-source, self-hosted Instagram comment-to-DM automation platform**. When someone comments on your post with a keyword, AutoDMX automatically replies with a DM containing a link, lead magnet, or call-to-action.

### Is AutoDMX free?

Yes. AutoDMX is licensed under the [MIT License](../LICENSE). You can use, modify, and self-host it for free. You are responsible for your own hosting, Supabase, and Meta API costs.

### Is AutoDMX affiliated with Meta or Instagram?

No. AutoDMX is an independent open-source project. Instagram and Meta are trademarks of their respective owners. AutoDMX uses the official Meta Graph API and follows Meta's platform policies.

### Does AutoDMX work with personal Instagram accounts?

AutoDMX requires an **Instagram Business or Creator account** connected to a **Meta App with Instagram Graph API access**. Personal accounts are not supported by the Instagram Graph API.

### Will using AutoDMX get my account banned?

AutoDMX is designed to **respect Meta's published rate limits** — the database-level queue guardrails make it hard to send more than Meta allows. That said, **spammy or abusive use of any automation can lead to restrictions**. Follow [Meta's Community Guidelines](https://help.instagram.com/477379105621756) and use AutoDMX responsibly.

---

## Setup

### Why do I need a Supabase project?

AutoDMX uses Supabase (managed Postgres) for storing accounts, automations, contacts, conversation state, and the rate-limited send queue. You can use the free Supabase tier to get started.

### Why do I need a Meta App?

AutoDMX integrates with Instagram via the **Meta Graph API**, which requires a registered Meta App. This is how AutoDMX receives comment webhooks and sends DMs.

### How do I get a long-lived access token?

See Meta's [Access Token Guide](https://developers.facebook.com/docs/facebook-login/access-tokens). In short:

1. Generate a short-lived user token via the Graph API Explorer.
2. Exchange it for a long-lived (~60 day) token with the `oauth/access_token` endpoint.
3. Optionally exchange that for a never-expiring **page token** if you have a connected Facebook Page.

### What is `ENCRYPTION_KEY` for?

Instagram access tokens are **encrypted at rest** in your database using **AES-256-GCM**. The `ENCRYPTION_KEY` is the secret that protects them. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Can I run AutoDMX without Supabase?

Not currently. Supabase (or a compatible Postgres instance) is a hard dependency. The `lib/supabase.ts` client is used throughout the codebase.

### Can I run AutoDMX on a Raspberry Pi / shared hosting?

AutoDMX is a Next.js app — it runs anywhere Node.js runs. The cron drain endpoint can be called from any external scheduler, so you can run the Next.js app on a Pi and the cron on a free service like GitHub Actions. Supabase is hosted by Supabase, so you don't need a database server locally.

---

## Features

### Does AutoDMX support TikTok / X / YouTube?

Not yet. AutoDMX is **Instagram-first**. Multi-platform support is on the [roadmap](../ROADMAP.md) and depends on community interest and contributions.

### Can I send images / videos in DMs?

Currently AutoDMX sends **text DMs with links**. Rich media support is on the roadmap.

### Can I require users to follow me before they get the DM?

Yes — the **follow-gating** step in `lib/instagram.ts` checks whether the user follows your account and, if not, sends a follow-prompt message instead. Enable it per-automation in the dashboard.

### Can I A/B test reply messages?

Yes — the **public reply variants** feature lets you define multiple replies per automation. AutoDMX rotates through them.

### Can I track link clicks?

Yes — AutoDMX wraps links in a redirect that records clicks in the `link_clicks` table and the analytics dashboard.

---

## Operations

### How do I back up my data?

- **Supabase** — schedule automated backups in the Supabase dashboard (Pro plan and above). On the free plan, use `pg_dump` against the connection string in your dashboard.
- **Code** — your GitHub repo is the source of truth.

### How do I rotate my `ENCRYPTION_KEY`?

Rotating the encryption key requires:

1. Decrypt all tokens with the old key.
2. Re-encrypt with the new key.
3. Update the env var.
4. Restart the app.

This is not yet automated. See issue tracker for progress.

### How do I migrate to a new Supabase project?

1. Export your data with `pg_dump` from the old project.
2. Import into the new project.
3. Update `NEXT_PUBLIC_SUPABASE_URL` and the keys in your hosting provider.
4. Restart.

---

## Troubleshooting

### My webhook isn't being called

- Check that the webhook is **subscribed** in your Meta App dashboard.
- Make sure the **callback URL** matches your deployed domain exactly (https, no trailing slash).
- Check `META_VERIFY_TOKEN` matches.
- Tail your server logs — Meta will retry several times if it gets non-2xx responses.

### My DMs are being rate-limited

- AutoDMX automatically defers 429s with exponential backoff. You don't need to do anything.
- If you're hitting limits frequently, you're probably running multiple automations on the same account — consider consolidating.
- Verify in the dashboard analytics that you're not exceeding your per-hour allowance.

### The dashboard won't load

- Make sure `DASHBOARD_PASSWORD` is set in your env.
- Clear cookies and reload.
- Check that the middleware is enabled (`middleware.ts` is at the project root).

### I'm getting an "Invalid signature" error

- `META_APP_SECRET` is wrong, or
- The request body is being re-serialized before signature verification. Make sure the webhook handler uses the **raw body** for HMAC verification.

---

## Contributing

### How can I help?

See [CONTRIBUTING.md](../CONTRIBUTING.md). The most valuable contributions right now:

- 🧪 Tests (we have very few)
- 📖 Documentation
- 🐛 Bug fixes
- 🌍 Translations
- 🎨 UI polish

### How do I propose a new feature?

Open a [feature request](https://github.com/Qaxlabs/AutoDMX/issues/new?template=feature_request.md). Discussion happens in the issue thread. Maintainers will triage and tag.

### How long until my PR is reviewed?

Maintainers aim to triage new issues and PRs within a few days. Detailed reviews can take longer. Be patient — this is a volunteer project.

---

## License & legal

### What license is AutoDMX released under?

[MIT](../LICENSE). You can use AutoDMX commercially, modify it, distribute it, and use it privately — as long as you preserve the copyright notice.

### Is there a hosted version of AutoDMX?

A hosted "AutoDMX-as-a-Service" is on the [roadmap](../ROADMAP.md) but does not exist yet. Until then, you'll self-host.

### Are there any usage restrictions?

- You must follow [Meta's Platform Terms](https://developers.facebook.com/terms) and [Instagram's Terms of Service](https://help.instagram.com/478745558852511).
- You must comply with [GDPR](https://gdpr-info.eu/), [CCPA](https://oag.ca.gov/privacy/ccpa), and other applicable privacy laws in your jurisdiction.
- The MIT License does not grant you trademark rights to the "AutoDMX" name or logo.

---

## Still have questions?

- 💬 [GitHub Discussions](https://github.com/Qaxlabs/AutoDMX/discussions)
- 🐛 [Open an issue](https://github.com/Qaxlabs/AutoDMX/issues/new/choose)
- 📖 [README](../README.md)

---

<div align="center">

Last updated July 2026.

</div>

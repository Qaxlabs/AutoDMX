# 🚀 Deploying AutoDMX

AutoDMX is a Next.js 14 App Router app with a serverless-friendly architecture. You can deploy it to most Node.js hosts. This guide covers the most common options.

> **Before you deploy:** complete the [Quick Start](../README.md#-quick-start) locally and confirm everything works. Deploying broken code is a chore to roll back.

---

## 📋 Pre-flight checklist

- [ ] You have a Supabase project with all migrations applied
- [ ] You have a Meta Developer App with Instagram Graph API access
- [ ] You have generated a long-lived Instagram access token
- [ ] You have a strong `ENCRYPTION_KEY` (32+ random characters)
- [ ] You have a `DASHBOARD_PASSWORD` and a `CRON_SECRET`
- [ ] You have chosen a hosting provider

---

## 1️⃣ Netlify (recommended)

AutoDMX is designed to run cleanly on Netlify Functions.

### Steps

1. **Push your code** to GitHub.
2. **Create a new site** in Netlify → "Import from Git" → pick your repo.
3. **Build settings** (auto-detected for Next.js):
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **Environment variables** — add all of `.env.example` to **Site settings → Environment variables**. Treat them as production secrets.
5. **Deploy.** Netlify will assign a URL like `https://your-site.netlify.app`.
6. **Note the URL** — you'll need it for the Meta webhook and the GitHub Actions cron secret.
7. **Test**:
   - Visit `https://your-site.netlify.app/` — landing page
   - Visit `https://your-site.netlify.app/dashboard` — password gate
   - Visit `https://your-site.netlify.app/api/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test` — should echo `test` if verification passes

### Continuous deployment

Every push to `main` triggers a production deploy. Use **branch deploys** or **deploy previews** for staging environments.

---

## 2️⃣ Vercel

1. **Push your code** to GitHub.
2. **Import the project** in Vercel.
3. Vercel auto-detects Next.js. Accept the defaults.
4. **Add environment variables** in the Vercel dashboard.
5. **Deploy.**

> Vercel works out-of-the-box. If you need to customize, edit `next.config.mjs` and `vercel.json`.

---

## 3️⃣ Self-hosted (Docker)

> 🐳 A first-party Docker image is on the [roadmap](../ROADMAP.md). In the meantime, you can build one yourself.

Minimal `Dockerfile`:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

Then:

```bash
docker build -t autodmx .
docker run -p 3000:3000 --env-file .env.local autodmx
```

For HTTPS, put it behind [Caddy](https://caddyserver.com), [Traefik](https://traefik.io), or [nginx](https://nginx.org) with a reverse proxy + Let's Encrypt certificate.

---

## 4️⃣ Self-hosted (bare Node)

```bash
git clone https://github.com/Qaxlabs/AutoDMX.git
cd AutoDMX
cp .env.example .env.local
# Edit .env.local with your values
npm ci --omit=dev
npm run build
NODE_ENV=production npm start
```

Run under a process manager like [pm2](https://pm2.keymetrics.io) or [systemd](https://www.freedesktop.org/software/systemd/man/systemd.service.html).

---

## 🔔 Setting up the cron job

The send queue is drained by a cron-style endpoint. The included GitHub Actions workflow (`.github/workflows/cron.yml`) hits it every 10 minutes.

### Option A: GitHub Actions (default, free)

Add the following secrets to your GitHub repo (**Settings → Secrets and variables → Actions**):

- `NETLIFY_SITE_URL` — your deployed site URL (e.g. `https://your-site.netlify.app`)
- `CRON_SECRET` — must match the value in your hosting provider's env vars
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_ANON_KEY` — your Supabase anon key (the workflow pings Supabase to keep the free tier active)

The workflow runs on the schedule defined in `.github/workflows/cron.yml`:

```yaml
schedule:
  - cron: "*/10 * * * *"   # every 10 minutes
```

> **Heads up:** GitHub Actions scheduled workflows can be delayed by 5–15 minutes during high load. For more reliable timing, use Option B.

### Option B: External cron service

Use a service like [cron-job.org](https://cron-job.org), [EasyCron](https://www.easycron.com), or your server's `crontab`:

```cron
*/10 * * * * curl -X POST "https://your-domain.com/api/cron/drain-queue" -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📡 Setting up the Meta webhook

1. In your **Meta App dashboard**, go to **Instagram → Webhooks**.
2. Click **Subscribe to webhook** for the object `Comments`.
3. Set the **Callback URL** to `https://your-domain.com/api/webhook`.
4. Set the **Verify token** to the same value as your `META_VERIFY_TOKEN` env var.
5. Subscribe to the **Comments** field.
6. Meta will issue a verification GET request — AutoDMX will echo back the challenge.

### Test the webhook

Meta provides a **Test** button in the webhook configuration. Or you can simulate a comment locally with `mock-trigger.js` (already included in the repo).

---

## 🔐 Post-deployment security

- [ ] All `.env` values are unique per environment (no shared secrets between staging and production)
- [ ] `DASHBOARD_PASSWORD` is strong and not reused elsewhere
- [ ] `ENCRYPTION_KEY` is 32+ random characters and stored in your secrets manager
- [ ] `CRON_SECRET` is unique
- [ ] HTTPS is enforced (most hosts do this by default)
- [ ] Supabase RLS is enabled (the included migrations set this up)
- [ ] Database backups are scheduled in the Supabase dashboard
- [ ] You have reviewed [`SECURITY.md`](../SECURITY.md)

---

## 📊 Observability

Out of the box, AutoDMX logs to the host's stdout (Netlify Functions logs, Vercel logs, Docker logs).

For production, consider:

- [Sentry](https://sentry.io) for error tracking
- [Logflare](https://logflare.app) or [Better Stack](https://betterstack.com) for log aggregation
- [UptimeRobot](https://uptimerobot.com) for uptime monitoring on `/api/health` (coming soon)

---

## 🆘 Troubleshooting

### "Invalid signature" on webhook

- `META_APP_SECRET` is wrong, or
- The request body is being re-serialized before signature verification (use the raw body)

### Cron job returns 401

- `CRON_SECRET` doesn't match between the caller (GitHub Actions / external service) and the deployed app

### Dashboard won't load

- Check `DASHBOARD_PASSWORD` is set
- Clear cookies and try again

### Migrations not applied

- Run them via Supabase SQL editor or `supabase db push`

### Still stuck?

- 💬 [GitHub Discussions](https://github.com/Qaxlabs/AutoDMX/discussions)
- 🐛 [Open an issue](https://github.com/Qaxlabs/AutoDMX/issues/new/choose)

---

<div align="center">

Happy deploying! 🚀

</div>

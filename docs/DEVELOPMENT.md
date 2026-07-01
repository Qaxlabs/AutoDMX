# Development Guide

> For end-user setup, see the [README](../README.md). This document is for contributors working on the AutoDMX codebase.

---

## 🧰 Tooling

| Tool | Purpose |
| --- | --- |
| **Node.js 18+** | Runtime |
| **npm** | Package manager (use `npm ci` for reproducible installs) |
| **TypeScript 5** | Type system (strict mode) |
| **Next.js 14** | Framework (App Router) |
| **Tailwind CSS** | Styling |
| **ESLint** | Linting (uses `eslint-config-next`) |
| **Supabase CLI** *(optional)* | Local DB + migrations |

---

## 🏃‍♂️ Common commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run start        # Run the production build
npm run lint         # Lint the project
npx tsc --noEmit     # Type-check without emitting JS
```

---

## 📁 Where to look

| Concern | Location |
| --- | --- |
| Landing page | `app/page.tsx` |
| Dashboard | `app/dashboard/` |
| API routes (webhook, cron) | `app/api/` |
| Instagram / Meta API logic | `lib/instagram.ts` |
| Encryption | `lib/crypto.ts` |
| Supabase client | `lib/supabase.ts`, `utils/supabase/` |
| Auth gate | `middleware.ts` |
| DB schema | `supabase/migrations/` |
| Cron schedule | `.github/workflows/cron.yml` |

---

## 🌿 Branching

- Default branch: `main`
- Feature branches: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`, etc. See [CONTRIBUTING.md](../CONTRIBUTING.md#development-workflow) for the full list.
- Always branch from the latest `main`.

```bash
git fetch upstream
git checkout main
git pull upstream main
git checkout -b feat/your-feature
```

---

## 🧪 Testing

> ⚠️ Automated tests are still being built. See the [Roadmap](../ROADMAP.md).

In the meantime:

1. **Manually test webhook flow** with `mock-trigger.js` (in the repo root):

   ```bash
   node mock-trigger.js
   ```

2. **Manually test routes** with `test-routes.js`:

   ```bash
   node test-routes.js
   ```

3. **Manually test Supabase** with `test_supabase.js`:

   ```bash
   node test_supabase.js
   ```

4. **End-to-end**: open the dashboard, create an automation, comment on a real Instagram post, and verify the DM fires.

---

## 🐛 Debugging tips

- **Inspect Supabase data** — use the Table Editor in the Supabase dashboard.
- **Tail server logs** — Netlify: `netlify logs`; Vercel: `vercel logs`; Docker: `docker logs -f <container>`.
- **Reproduce Meta API calls** — use the [Graph API Explorer](https://developers.facebook.com/tools/explorer/) with your own access token.
- **Test webhook delivery locally** — use [ngrok](https://ngrok.com) to expose `localhost:3000` and set the public URL in your Meta App webhook config.
- **Reset local state** — drop the `.next/` directory (`rm -rf .next`) and restart.

---

## 📦 Adding a dependency

1. Install with `npm install <package>`.
2. Use the package from server components by default; only add client-side dependencies if absolutely needed (bundle size matters).
3. Update the lockfile (commit `package-lock.json`).
4. Mention it in the PR description.

---

## 🗃️ Adding a database migration

> ⚠️ Schema changes **must** be additive. Never edit a migration that has been merged into `main`.

1. Create a new file in `supabase/migrations/` with the next timestamp:

   ```bash
   touch supabase/migrations/$(date +%Y%m%d%H%M%S)_your_change.sql
   ```

2. Write the SQL. Use `CREATE TABLE`, `ALTER TABLE`, etc. — never modify an existing migration.

3. Enable RLS on any new user-data table:

   ```sql
   alter table your_new_table enable row level security;
   ```

4. Test locally:

   ```bash
   supabase db reset
   supabase db push
   ```

5. Add an entry to `CHANGELOG.md` under **Unreleased**.

---

## 🎨 Adding a UI component

- Default to **server components**. Add `"use client"` only when you need state, effects, or browser APIs.
- Co-locate small components next to their parents. Move shared components into a new `app/dashboard/_components/` directory (Next.js ignores folders prefixed with `_`).
- Stick to Tailwind utility classes. Avoid inline styles except for truly dynamic values.
- Match the existing color palette and spacing. Check `app/page.tsx` for examples.

---

## 📥 Adding an API route

- Place under `app/api/<route>/route.ts`.
- Export `GET`, `POST`, etc. — no default export.
- Verify the request body, headers, and authentication before doing any work.
- Return a `Response` object with the right status code. Don't `throw` for control flow.
- For sensitive routes, validate the `Authorization` header (see `app/api/cron/drain-queue/route.ts`).

---

## 🔐 Security checklist for new code

Before opening a PR, run through this list:

- [ ] No new secrets, tokens, or PII in the code or logs
- [ ] No new public API endpoints without auth
- [ ] All user input is validated (length, type, allowlist)
- [ ] All Supabase tables have RLS enabled
- [ ] All outbound webhooks verify signatures
- [ ] All environment variables are documented in `.env.example`
- [ ] No `dangerouslySetInnerHTML` or `eval` in client code
- [ ] No new dependencies with known critical CVEs (`npm audit`)

---

## 📣 Communication

- 💬 [Discussions](https://github.com/Qaxlabs/AutoDMX/discussions) for open questions
- 🐛 [Issues](https://github.com/Qaxlabs/AutoDMX/issues) for bug reports and feature requests
- 🔒 Private security disclosures — see [SECURITY.md](../SECURITY.md)

---

<div align="center">

Happy hacking! 🚀

</div>

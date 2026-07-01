# Security Policy

## 🔒 Our Commitment

AutoDMX takes the security of our project — and your data — seriously. We appreciate the security research community's efforts to responsibly disclose vulnerabilities and will do our best to acknowledge and address valid reports promptly.

---

## ✅ Supported Versions

We provide security updates for the **latest minor release** of AutoDMX. Older versions may not receive patches — please keep your deployment up to date.

| Version | Supported          |
| ------- | ------------------ |
| `main`  | ✅ Yes             |
| Latest release | ✅ Yes     |
| Older releases | ❌ No — please upgrade |

---

## 📣 Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions, or social media.**

Instead, please report them privately using one of the following channels:

1. **GitHub Security Advisories** (preferred): Use the [private vulnerability reporting](https://github.com/Qaxlabs/AutoDMX/security/advisories/new) feature on the repository.
2. **Email**: Contact a maintainer directly via the GitHub profiles linked in the [`README.md`](./README.md).

Please include as much of the following information as possible:

- **Type of vulnerability** (e.g. SQL injection, XSS, authentication bypass, SSRF)
- **Full path(s)** of the affected source file(s)
- **Location of the affected code** (tag, branch, commit, or URL)
- **Step-by-step reproduction instructions**
- **Proof-of-concept code or screenshots** (if applicable)
- **Impact assessment** — what an attacker could achieve
- **Your contact information** (optional, in case we need to follow up)

---

## 🕐 What to Expect

When you submit a vulnerability report, here's our process:

1. **Acknowledgement** — We'll confirm receipt of your report within **72 hours**.
2. **Triage** — We'll investigate the report and assess severity within **7 days**.
3. **Fix development** — A patch will be developed for confirmed vulnerabilities.
4. **Coordinated disclosure** — We'll work with you on a disclosure timeline. Typically, we aim to release a fix within **30 days** of confirmation, with a public advisory published at the same time.
5. **Credit** — With your permission, we'll credit you in the security advisory and release notes.

We may ask for additional information or clarification during the process. We appreciate your patience and partnership.

---

## 🛡️ Security Best Practices for Self-Hosters

If you're deploying AutoDMX yourself, please follow these recommendations:

### Environment & secrets

- ✅ **Never commit `.env.local` or any secrets** to version control. Use the `.env.example` template for documentation.
- ✅ Generate a strong, random `ENCRYPTION_KEY` (at least 32 characters). Treat it like a database password.
- ✅ Rotate your `CRON_SECRET`, `META_VERIFY_TOKEN`, and `META_APP_SECRET` periodically.
- ✅ Use a secrets manager (e.g. Netlify env vars, AWS Secrets Manager, Doppler) — not shell history.

### Database

- ✅ Enable **Row Level Security (RLS)** on all Supabase tables. The included migrations set this up.
- ✅ Restrict the `SUPABASE_SERVICE_ROLE_KEY` to server-side code only. Never expose it to the browser.
- ✅ Use the `NEXT_PUBLIC_SUPABASE_ANON_KEY` for any client-side access — it's safe by design but limited by RLS.
- ✅ Take regular database backups via the Supabase dashboard.

### Networking & deployment

- ✅ Always deploy over **HTTPS**. Free options include Netlify, Vercel, and Cloudflare.
- ✅ Set secure `Cookie` flags (`HttpOnly`, `Secure`, `SameSite=Strict`) on any auth cookies.
- ✅ Use a strong `DASHBOARD_PASSWORD` — the included middleware gates the dashboard with a single password.
- ✅ Restrict access to the dashboard path with basic auth or VPN if you have stricter requirements.

### Meta & Instagram

- ✅ Only grant the **minimum required scopes** to your Meta app.
- ✅ Use a **long-lived access token** (60 days) and refresh it before expiry.
- ✅ Subscribe only to the **webhook fields you actually need** (e.g. `comments`).
- ✅ Verify the `X-Hub-Signature-256` header on inbound webhooks to confirm they came from Meta. See `app/api/webhook/route.ts` for the verification implementation.

### Dependencies

- ✅ Run `npm audit` regularly and update dependencies to receive upstream security fixes.
- ✅ Pin dependency versions in `package-lock.json` and review changes during updates.
- ✅ Consider adding automated dependency scanning (Dependabot, Snyk, Renovate) to your fork.

---

## 🔐 Cryptography

AutoDMX uses **AES-256-GCM** to encrypt Instagram access tokens at rest in the database. The encryption key is derived from your `ENCRYPTION_KEY` environment variable. See [`lib/crypto.ts`](./lib/crypto.ts) for the implementation.

- The auth tag and IV are stored alongside the ciphertext.
- Tokens are decrypted only when making API calls to Meta and are never returned to the browser.

---

## 🧾 Disclosure Policy

When we receive a security report, we follow a **coordinated disclosure** process:

- We do **not** publicly disclose the vulnerability until a fix is available.
- We work with the reporter to set a disclosure date.
- Once a fix is released, we publish a GitHub Security Advisory with full details and credit the reporter (if they wish).

---

## 🏷️ Known Security Considerations

- The dashboard is gated by a single shared password (`DASHBOARD_PASSWORD`). For multi-user or high-security deployments, integrate with a real identity provider (Supabase Auth is already a dependency and is a natural next step).
- The `/api/cron/drain-queue` endpoint is protected by a bearer token. Make sure `CRON_SECRET` is unique and not reused elsewhere.

---

## 🙏 Thanks

Thank you to all the security researchers and contributors who help keep AutoDMX and its users safe. Responsible disclosure is a gift to the community, and we honor that.

---

<div align="center">

For non-security bugs, please use [GitHub Issues](https://github.com/Qaxlabs/AutoDMX/issues).

</div>

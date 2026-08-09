# Changelog

All notable changes to AutoDMX will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Convention:** Versions follow `MAJOR.MINOR.PATCH`.
> - **MAJOR** — breaking changes
> - **MINOR** — new features, backwards-compatible
> - **PATCH** — bug fixes, backwards-compatible

---

## [Unreleased]

### Added
- Initial public open-source release of AutoDMX
- README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, LICENSE
- GitHub issue & PR templates

### Changed
- Changed project license from custom Qaxlabs Source-Available License v1.0 to MIT License

### Deprecated

### Removed

### Fixed

### Security

---

## [0.1.0] — 2026-07-01

### Added
- Instagram comment-to-DM automation engine (`lib/instagram.ts`)
- Webhook listener with Meta Graph API integration (`app/api/webhook/`)
- Webhook deduplication to prevent duplicate DM sends
- Rate-limited message queue with database-enforced guardrails
- Link tracking and click analytics
- Follow-check step (optionally require users to follow the account before receiving the DM)
- Public reply variants (A/B test reply messages)
- Cron endpoint to drain the send queue (`app/api/cron/drain-queue`)
- GitHub Actions cron workflow (`.github/workflows/cron.yml`) — runs every 10 minutes
- Dashboard with account, automation, contacts, conversations, and analytics views
- Password-protected dashboard middleware
- AES-256-GCM encryption for stored Instagram access tokens (`lib/crypto.ts`)
- Supabase migrations:
  - `20260628000000_init.sql` — core schema
  - `20260628000001_analytics.sql` — analytics tables
  - `20260628000002_remove_auth.sql` — simplified auth model
  - `20260629000000_webhook_id.sql` — webhook event IDs
  - `20260629000001_simplify_model.sql` — schema simplifications
  - `20260630000000_processed_comments.sql` — processed comment tracking
- Privacy, Terms, and Data Deletion pages (Meta compliance)
- Landing page (`app/page.tsx`) with feature highlights and CTAs

### Security
- Encrypted Instagram tokens at rest
- `META_VERIFY_TOKEN` for webhook verification
- Bearer-token auth on the cron endpoint
- Dashboard password gate

---

[Unreleased]: https://github.com/Qaxlabs/AutoDMX/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Qaxlabs/AutoDMX/releases/tag/v0.1.0

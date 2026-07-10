# Contributing to AutoDMX

First off — thank you for taking the time to contribute! 🎉
AutoDMX is an open-source project, and every bug report, feature suggestion, documentation improvement, and pull request helps us build a better tool for the community.

This document explains how to get started, the development workflow, and the standards we follow.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Style Guides](#style-guides)
- [Commit Messages](#commit-messages)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Community](#community)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

---

## 🤝 Ways to Contribute

There are many ways to make AutoDMX better:

- 🐛 **Report bugs** — Found a bug? [Open an issue](https://github.com/Qaxlabs/AutoDMX/issues/new?template=bug_report.md).
- 💡 **Suggest features** — Have an idea? [Open a feature request](https://github.com/Qaxlabs/AutoDMX/issues/new?template=feature_request.md).
- 📖 **Improve documentation** — Typos, clarity, examples, translations.
- 🧪 **Write tests** — Help us increase coverage and prevent regressions.
- 🔧 **Submit pull requests** — Bug fixes, new features, refactors.
- ⭐ **Star the repo** — Helps others discover AutoDMX.
- 📣 **Spread the word** — Blog posts, tweets, talks.

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js 18+** and **npm**
- A **Supabase** project (free tier is fine)
- A **Meta Developer App** with Instagram Graph API access
- **Git** for version control

### Local setup

1. **Fork the repository** on GitHub.

2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR-USERNAME/AutoDMX.git
   cd AutoDMX
   ```

3. **Add the upstream remote**:

   ```bash
   git remote add upstream https://github.com/Qaxlabs/AutoDMX.git
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase and Meta credentials. See the [README](./README.md#3-configure-environment-variables) for details.

6. **Run database migrations** against your Supabase project:

   ```bash
   supabase db push
   ```

7. **Start the dev server**:

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

---

## 🔁 Development Workflow

1. **Create a feature branch** from `main`:

   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feat/your-feature-name
   ```

   Use one of these branch prefixes:
   - `feat/` — new features
   - `fix/` — bug fixes
   - `docs/` — documentation only
   - `refactor/` — code changes that neither fix a bug nor add a feature
   - `test/` — adding or fixing tests
   - `chore/` — tooling, dependencies, config

2. **Make your changes.** Follow the [style guides](#style-guides) below.

3. **Run linting and type checks** before committing:

   ```bash
   npm run lint
   npx tsc --noEmit
   ```

4. **Test your changes manually.** Run `npm run dev` and exercise the affected flows in the dashboard and webhook handlers.

5. **Commit your changes** following the [commit message conventions](#commit-messages).

6. **Push your branch** to your fork:

   ```bash
   git push origin feat/your-feature-name
   ```

7. **Open a pull request** against `Qaxlabs/AutoDMX:main`. Fill in the PR template.

---

## ✅ Pull Request Process

1. **One concern per PR** — Keep pull requests focused. Larger changes should be split into smaller, reviewable units.
2. **Update documentation** if you change behavior. Update the README, inline code comments, and CHANGELOG as needed.
3. **Add a CHANGELOG entry** under the "Unreleased" section.
4. **All checks must pass** — Linting, type checks, and any automated tests.
5. **Request a review** from a maintainer. Be patient and responsive to feedback.
6. **Squash-merge** — Maintainers will squash-merge your PR. Your commit messages on the branch are still valuable for context.

A maintainer will review your PR and may request changes. Once approved, it will be merged.

---

## 🎨 Style Guides

### TypeScript / JavaScript

- We use **TypeScript** with `strict` mode. Avoid `any` where possible.
- Use **2-space** indentation.
- Prefer **named exports** over default exports for utilities.
- Use **async/await** instead of `.then()` chains.
- Format imports with the project's ESLint config: `npm run lint -- --fix`.

### React

- **Functional components** only. No class components.
- Use **App Router** conventions (server components by default, `"use client"` only when needed).
- Keep components small and focused. Extract reusable pieces into separate files.
- Co-locate styles, types, and helpers with the component when it makes sense.

### CSS / Styling

- We use **Tailwind CSS**. Avoid inline styles except for truly dynamic values.
- Follow existing color/spacing tokens. Don't introduce new arbitrary values without discussion.
- Dark mode is the default — all UI should look great on a dark background.

### Database / Supabase

- All schema changes **must** ship as a new migration in `supabase/migrations/`.
- Use a timestamp prefix matching the existing pattern: `YYYYMMDDHHMMSS_description.sql`.
- Never edit an existing migration that has been merged — add a new one.
- Use **Row Level Security (RLS)** for any new tables that store user data.

### Comments and documentation

- Prefer **self-explanatory code**. Comments should explain *why*, not *what*.
- Use **JSDoc** for exported functions and complex types.
- Keep the README up to date when adding features.

---

## 📨 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This allows us to auto-generate changelogs and keeps history readable.

Format:

```
<type>(<scope>): <short description>

<optional body — explain the *why*, not the *what*>

<optional footer — references to issues, breaking changes>
```

**Types:**

- `feat` — a new feature
- `fix` — a bug fix
- `docs` — documentation only changes
- `style` — formatting, missing semicolons, etc. (no code change)
- `refactor` — code change that neither fixes a bug nor adds a feature
- `test` — adding or correcting tests
- `chore` — tooling, dependencies, config

**Examples:**

```
feat(webhook): add deduplication for Instagram comment events

fix(cron): drain queue respects rate limit window
```

For breaking changes, add `!` after the type/scope and a `BREAKING CHANGE:` footer:

```
feat(api)!: rename /api/cron endpoint to /api/cron/drain-queue

BREAKING CHANGE: existing cron jobs must update the URL.
```

---

## 🐛 Reporting Bugs

Before opening a bug report:

1. **Search existing issues** — it may already be reported.
2. **Test on the latest `main`** — the bug may already be fixed.

When filing a [bug report](https://github.com/Qaxlabs/AutoDMX/issues/new?template=bug_report.md), please include:

- **Clear, descriptive title**
- **Steps to reproduce** the issue
- **Expected behavior** vs. **actual behavior**
- **Screenshots or logs** if applicable
- **Environment details** — Node version, OS, browser, deployment target
- **Relevant configuration** (with secrets redacted!)

---

## 💡 Suggesting Features

We love feature ideas! Before opening one:

1. **Search existing issues** to avoid duplicates.
2. **Consider the scope** — does it fit AutoDMX's mission of comment-to-DM automation?

When filing a [feature request](https://github.com/Qaxlabs/AutoDMX/issues/new?template=feature_request.md), please describe:

- **The problem** you're trying to solve
- **Your proposed solution**
- **Alternatives you've considered**
- **Additional context** — mockups, examples, references

---

## 🌐 Community

- 💬 **GitHub Discussions** — [Ask questions and share ideas](https://github.com/Qaxlabs/AutoDMX/discussions)
- 🐛 **GitHub Issues** — [Bug reports and feature requests](https://github.com/Qaxlabs/AutoDMX/issues)
- 📖 **README & docs** — Start from the [README](./README.md)

---

## 📄 License

By contributing to AutoDMX, you agree that your contributions will be licensed under the [Qaxlabs Source-Available License v1.0](./LICENSE).

---

<div align="center">

Thank you for making AutoDMX better! 💜

</div>

# AutoDMX

**Free, self-hosted Instagram DM automation — your own Zorcha / ChatAutoDM clone.**

AutoDMX listens to your Instagram comments and DMs, then replies automatically based on rules you control. It's a complete alternative to paid SaaS tools: you bring your own backend, your own database, your own API keys. There are no per-message fees, no seat licenses, no surprise price hikes.

> ⚠️ **For personal / individual use only.** This project is for creators who want to automate replies on **their own** Instagram account. Meta's API terms require each user to create and connect their own Meta App — AutoDMX does not (and cannot) provide shared credentials.

---

## ✨ What it does

- 💬 **Comment-triggered DMs** — When someone comments a keyword on a post, AutoDMX DMs them the reply of your choice.
- 📩 **Story-reply DMs** — Same idea for Instagram story replies.
- 🤖 **AI FAQ responder** — Trains on your own question/answer pairs using Groq (free, fast LLM inference).
- 🔒 **Follow-gate flows** — Require the user to follow you before sending the link / lead magnet.
- 📧 **Lead capture** — Optionally collect email and/or phone from each contact into a Supabase table.
- 📊 **Built-in analytics** — Tracks DMs sent, comments triggered, follows requested, daily and lifetime.
- 📤 **CSV export** — One click to export every contact for your CRM or email tool.
- 🎨 **Self-hosted dashboard** — Single-page React app to manage flows, FAQs, leads, and settings.

---

## 🧱 Tech stack

| Layer        | Tech                                      |
|--------------|-------------------------------------------|
| Frontend     | React 18 + Vite + Tailwind CSS            |
| Backend      | FastAPI (Python 3.11+)                    |
| Database     | Supabase (Postgres + Auth)                |
| Webhook      | Meta Graph API (Instagram)                |
| AI           | Groq (free tier, llama-3.x models)        |
| Hosting FE   | Vercel                                    |
| Hosting BE   | Render                                    |

---

## 📋 Prerequisites

You will need **accounts** for the following — all free tiers are sufficient to run AutoDMX.

1. **Meta Developer Account** with a configured Instagram App and **Instagram Business Account** connected. You'll get a `META_ACCESS_TOKEN`, `META_APP_ID`, `META_APP_SECRET`, and `INSTAGRAM_ACCOUNT_ID`. See Meta's [Getting Started guide](https://developers.facebook.com/docs/instagram-api/getting-started).
2. **Supabase account** — [supabase.com](https://supabase.com). Free tier is plenty. You'll create a project and get a `SUPABASE_URL` + `SUPABASE_KEY`.
3. **Groq API key** — [console.groq.com](https://console.groq.com). Free tier gives generous limits.
4. **Render account** — [render.com](https://render.com). For hosting the FastAPI backend.
5. **Vercel account** — [vercel.com](https://vercel.com). For hosting the React frontend.
6. **Local tools**: **Node.js 18+** and **Python 3.11+**.

---

## 🚀 Setup guide

### 1. Clone the repo

```bash
https://github.com/Qaxlabs/AutoDMX
cd autodmx
```

### 2. Create the Supabase tables

In the Supabase SQL editor, run this schema (adjust to taste):

```sql
create table flows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger_keywords text[] default '{}',
  trigger_type text default 'comment',
  require_follow boolean default false,
  message_1 text,
  message_2 text,
  link text,
  collect_email boolean default false,
  collect_phone boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  instagram_user_id text,
  username text,
  email text,
  phone text,
  flow_id uuid references flows(id) on delete set null,
  conversation_state text default 'new',
  last_interaction text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table messages_log (
  id uuid primary key default gen_random_uuid(),
  instagram_user_id text,
  direction text,
  message_type text,
  content text,
  media_id text,
  flow_id uuid references flows(id) on delete set null,
  created_at timestamptz default now()
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  created_at timestamptz default now()
);

create table analytics (
  date date primary key,
  dms_sent integer default 0,
  comments_triggered integer default 0,
  follows_requested integer default 0,
  updated_at timestamptz default now()
);
```

### 3. Configure environment variables

Create `backend/.env` (see [.env.example](#-env-example) below) and fill in every value:

| Variable              | Where it comes from                                  |
|-----------------------|------------------------------------------------------|
| `META_ACCESS_TOKEN`   | Meta Developer dashboard → Instagram → User Token    |
| `META_APP_ID`         | Meta Developer → App → Settings → Basic              |
| `META_APP_SECRET`     | Meta Developer → App → Settings → Basic              |
| `INSTAGRAM_ACCOUNT_ID`| Meta Graph API → `GET /me/accounts`                   |
| `WEBHOOK_VERIFY_TOKEN`| Any random string you choose (you'll reuse it in Meta)|
| `SUPABASE_URL`        | Supabase project → Settings → API                    |
| `SUPABASE_KEY`        | Supabase project → Settings → API (`anon` is fine)   |
| `GROQ_API_KEY`        | console.groq.com → API Keys                          |

### 4. Run locally

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (in a second terminal):**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, go to **Settings**, and paste your backend URL (e.g. `http://localhost:8000`). Click **Test Connection** — you should see a green ✅.

---

## 🔐 `.env.example`

Place this at `backend/.env` (or `.env.example` if you're committing a template):

```env
# --- Meta / Instagram ---
META_ACCESS_TOKEN=your_long_lived_user_access_token
META_APP_ID=1234567890
META_APP_SECRET=abcdef123456
INSTAGRAM_ACCOUNT_ID=17841234567890123

# --- Webhook ---
# Pick any random string. You'll paste the same value into Meta's webhook setup.
WEBHOOK_VERIFY_TOKEN=change-me-to-something-secret

# --- Supabase ---
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_or_service_role_key

# --- Groq ---
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ☁️ Deployment

### Backend → Render

1. Push the repo to GitHub.
2. In Render, click **New +** → **Web Service** → select your repo.
3. Set:
   - **Root directory:** `backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Add every env var from `.env.example` in the **Environment** tab.
5. Deploy. Copy the public URL (e.g. `https://autodmx.onrender.com`).

### Frontend → Vercel

1. In Vercel, click **Add New → Project** → import the same repo.
2. Set **Root Directory** to `frontend`. Vercel auto-detects Vite.
3. Add an environment variable:
   - `VITE_API_BASE_URL` = your Render backend URL (optional — the user can also paste it into the Settings page).
4. Deploy. Your dashboard is live at `https://<project>.vercel.app`.

---

## 🔗 Connect the Meta Webhook

After both services are deployed:

1. Go to [developers.facebook.com](https://developers.facebook.com) → your App → **Webhooks**.
2. Add a webhook subscription for **Instagram**:
   - **Callback URL:** `https://<your-render-app>.onrender.com/webhook/webhook`
   - **Verify Token:** the same value you put in `WEBHOOK_VERIFY_TOKEN`.
3. Subscribe to these fields:
   - `comments`
   - `messages`
   - `messaging_postbacks` *(optional)*
4. In **App → Products → Instagram → Webhooks**, link the Instagram Business Account.
5. Send a test event from the Meta UI — it should show as ✅ in Render logs.

If verification fails, double-check that `WEBHOOK_VERIFY_TOKEN` matches **exactly** between your `.env` and the Meta dashboard.

---

## 📁 Project layout

```
autodmx/
├── backend/
│   ├── main.py          # FastAPI entrypoint
│   ├── webhook.py       # Meta webhook verification + handler
│   ├── flows.py         # Automation logic (comment + DM processing)
│   ├── leads.py         # /leads CRUD + CSV export
│   ├── analytics.py     # /analytics/summary + update_analytics helper
│   ├── ai_faq.py        # Groq-powered FAQ responder
│   ├── config.py        # Settings from .env
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/       # Dashboard, Flows, FAQs, Leads, Settings
│   │   ├── components/  # Sidebar, Modal, BarChart
│   │   └── lib/api.js   # Backend URL from localStorage
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🤝 Contributing

PRs welcome! A few guidelines:

- **Keep it self-hosted.** No proprietary SaaS dependencies, no telemetry, no paid-only services.
- **Match the existing style.** FastAPI routers use the patterns in `backend/flows.py`; React components use Tailwind utility classes plus the shared `card` / `btn-*` / `badge-*` classes from `src/index.css`.
- **Test against your own Instagram account.** Don't point test deployments at anyone else's handle — Meta will flag it.
- **Run before you push:**
  ```bash
  # Backend
  cd backend && uvicorn backend.main:app --reload
  # Frontend
  cd frontend && npm run build
  ```

Open an issue first if you're planning a big change — it's easier to align before you write the code.

---

## 📜 License

MIT — see [LICENSE](LICENSE). You're free to fork, modify, and self-host this however you like. Just remember that **Meta's API terms still apply**: you need your own Meta App, your own access token, and you may only automate your own Instagram account.

---

## 🙏 Credits

Inspired by the feature sets of Zorcha, ChatAutoDM, and ManyChat — built from scratch as an open, self-hostable alternative. LLM inference powered by [Groq](https://groq.com).
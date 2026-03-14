# 🚀 Deployment Guide

Complete step-by-step instructions to go from local → live in production.

---

## Overview

| What          | Where         | Cost        |
|---------------|---------------|-------------|
| Frontend      | Vercel        | Free        |
| Backend       | Railway       | Free tier   |
| Database      | Supabase      | Free tier   |
| CI/CD         | GitHub Actions| Free        |

---

## Step 1 — Push to GitHub

```bash
# From the project root
git init
git add .
git commit -m "Initial commit"

# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/social-subtext-decoder.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo**
3. Select `social-subtext-decoder` → set **Root Directory** to `backend`
4. Railway auto-detects Node.js via `railway.json`

### Set environment variables in Railway dashboard:

| Variable            | Value                                         |
|---------------------|-----------------------------------------------|
| `ANTHROPIC_API_KEY` | Your key from [console.anthropic.com](https://console.anthropic.com) |
| `NODE_ENV`          | `production`                                  |
| `PORT`              | `3001`                                        |
| `ALLOWED_ORIGINS`   | `https://your-app.vercel.app` *(set after Vercel deploy)* |

5. Click **Deploy** — Railway gives you a URL like `https://your-app.railway.app`

---

## Step 3 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Framework preset: **Vite** (auto-detected)

### Set environment variables in Vercel dashboard:

| Variable        | Value                                          |
|-----------------|------------------------------------------------|
| `VITE_API_URL`  | `https://your-app.railway.app/api`             |

5. Click **Deploy** — Vercel gives you a URL like `https://your-app.vercel.app`

---

## Step 4 — Update CORS on Backend

Go back to Railway → update `ALLOWED_ORIGINS`:

```
ALLOWED_ORIGINS=https://your-app.vercel.app
```

Redeploy the backend (Railway does this automatically on save).

---

## Step 5 — Verify it works

```bash
# Health check
curl https://your-app.railway.app/health

# Test decode endpoint
curl -X POST https://your-app.railway.app/api/decode \
  -H "Content-Type: application/json" \
  -H "x-session-id: test-session-abc123" \
  -d '{"phrase": "We should hang out sometime"}'
```

Expected response:
```json
{
  "success": true,
  "phrase": "We should hang out sometime",
  "decoded": {
    "literal": "...",
    "social": "...",
    "tone": { "label": "Polite but Cold", "explanation": "..." },
    "suggestedResponses": [...],
    "confidence": "medium",
    "tip": "..."
  }
}
```

---

## Optional: Add Supabase for persistent history

1. Create project at [supabase.com](https://supabase.com)
2. Run this SQL in the Supabase SQL editor:

```sql
create table history (
  id          text primary key,
  session_id  text not null,
  phrase      text not null,
  decoded     jsonb not null,
  saved_at    timestamptz default now()
);

-- Index for fast session lookups
create index history_session_id_idx on history(session_id);

-- Auto-delete entries older than 30 days
create or replace function delete_old_history()
returns void as $$
  delete from history where saved_at < now() - interval '30 days';
$$ language sql;
```

3. Add to Railway env vars:
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

4. In `historyController.js`, swap the in-memory store for the Supabase calls
   marked with `[SUPABASE]` comments.

---

## Custom Domain (optional)

**Vercel**: Settings → Domains → Add your domain → update DNS records  
**Railway**: Settings → Networking → Custom Domain

---

## Monitoring

- **Railway**: Built-in logs under the Deployments tab
- **Vercel**: Functions tab shows edge logs
- Add [Sentry](https://sentry.io) for error tracking (free tier available)

---

## Environment Variables — Full Reference

### Backend (`backend/.env`)
```env
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app.vercel.app
SUPABASE_URL=https://xxxx.supabase.co       # optional
SUPABASE_ANON_KEY=eyJ...                    # optional
```

### Frontend (`frontend/.env.local`)
```env
VITE_API_URL=https://your-app.railway.app/api
```

> ⚠️ Never commit `.env` files. They are in `.gitignore` already.

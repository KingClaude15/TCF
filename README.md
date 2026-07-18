# TCF 41-Day Challenge

A modern, responsive web app that helps TCF Canada candidates complete a structured 41-day preparation plan, with AI-evaluated writing (Expression Écrite), progress tracking, statistics, and achievements.

**Stack:** React (Vite) · Tailwind CSS · React Router · Supabase (Auth + Postgres + Edge Functions) · Google Gemini API (free tier, no credit card)

---

## 1. Project structure

```
tcf-41-day-challenge/
├── src/
│   ├── components/
│   │   ├── layout/        # AppLayout, Sidebar, Topbar, ProtectedRoute
│   │   ├── ui/             # ProgressBar, StatCard, Modal, EmptyState
│   │   ├── calendar/        # DayCard
│   │   ├── co/               # SeriesForm, SeriesHistory (shared by CO & CE)
│   │   └── ee/                # AiFeedbackPanel
│   ├── context/          # AuthContext, ThemeContext
│   ├── hooks/             # useChallengeData (central data loader)
│   ├── pages/             # One file per route
│   ├── services/          # Supabase queries, grouped by domain
│   ├── data/               # Static EE prompts
│   └── lib/supabaseClient.js
├── supabase/
│   ├── migrations/0001_init.sql   # Full DB schema + RLS policies
│   └── functions/evaluate-essay/  # Edge Function calling OpenAI securely
└── .env.example
```

The frontend never talks to Google directly — the `evaluate-essay` Supabase Edge Function holds the `GEMINI_API_KEY` as a server-side secret and is the only thing that calls the Gemini API. This keeps your key out of the browser bundle.

## 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/migrations/0001_init.sql`. This creates all tables (`profiles`, `daily_progress`, `co_results`, `ce_results`, `ee_submissions`, `ai_feedback`, `achievements`, `achievement_catalog`, `statistics_daily`), enables Row Level Security so each user only ever sees their own data, and adds a trigger that auto-creates a profile + 41 `daily_progress` rows whenever someone signs up.
3. Enable **Email** auth and **Google** auth under Authentication → Providers (Google needs an OAuth Client ID/Secret from Google Cloud Console; set the redirect URL Supabase gives you).
4. Install the Supabase CLI, then deploy the edge function:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy evaluate-essay
   supabase secrets set GEMINI_API_KEY=your-free-gemini-key
   ```
   Get a free Gemini key (no credit card needed) at [aistudio.google.com](https://aistudio.google.com) → "Get API key".
   (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are already available to edge functions automatically.)

## 3. Configure the frontend

```bash
cp .env.example .env
```
Fill in:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Run locally

```bash
npm install
npm run dev
```

## 5. Build for production

```bash
npm run build
```
Deploy the `dist/` folder to Vercel, Netlify, Cloudflare Pages, or any static host.

---

## Key design decisions

- **RLS everywhere** — every table has row-level security scoped to `auth.uid()`, so one user's SQL query can never return another user's rows even if the client code had a bug.
- **Streaks & achievements are recomputed, not manually incremented** — `recalculateStreak()` and `evaluateAchievements()` derive state from `daily_progress`/`co_results`/`ce_results` on every load, so they can never drift out of sync.
- **Recommendation engine is pure functions** (`src/services/recommendationEngine.js`) — no network calls, easy to unit test, takes already-fetched data and returns a prioritized list.
- **CO and CE share components** (`components/co/SeriesForm.jsx`, `SeriesHistory.jsx`) since their data shape and UX are identical; only the Supabase table and copy differ.
- **41 `daily_progress` rows are created automatically** by a Postgres trigger on signup (`handle_new_user()`), not from the client, so calendar completeness is guaranteed.

## Extending it

- Swap the placeholder prompts in `src/data/eeTopics.js` for official past TCF Canada EE topics.
- The `evaluate-essay` function is also where you'd add CO/CE audio or reading-passage grading if you want AI-scored input for those modules too.
- `statistics_daily` is scaffolded but not yet populated — wire up a scheduled Supabase Edge Function (cron) if you want faster-loading historical charts instead of computing everything client-side.

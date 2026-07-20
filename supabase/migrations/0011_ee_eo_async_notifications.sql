-- =========================================================
-- Async EE/EO evaluation + notifications
--
-- WHY: evaluate-essay / evaluate-eo used to run the entire Gemini call
-- synchronously inside the HTTP request the client waits on. That's what
-- produced the 504 Gateway Timeout (execution_time_ms: 150097 — the
-- platform's own wall-clock limit) and made a single slow/failing call
-- block the whole "Soumettre le sujet" button for up to 2.5 minutes.
--
-- It also meant that when Gemini returned 429 RESOURCE_EXHAUSTED (daily
-- free-tier quota of 20 requests), nothing stopped the student from
-- immediately retrying — or submitting a different sujet — while the
-- first request was still "en cours", burning through the same shared
-- quota even faster.
--
-- This migration adds what's needed to:
--   1. Mark a submission 'evaluating' immediately, respond fast, and do
--      the actual Gemini call in the background (edge function change).
--   2. Detect "is there already an evaluation in progress for this
--      user?" so a second submission can be blocked client- and
--      server-side instead of firing another Gemini call.
--   3. Record *why* an evaluation failed (quota vs transient vs other)
--      so the student sees an accurate, actionable message.
--   4. Notify the student when a result becomes available.
-- =========================================================

-- ---- ee_submissions: status lifecycle + failure/lock tracking ----
alter table public.ee_submissions drop constraint if exists ee_submissions_status_check;
alter table public.ee_submissions
  add constraint ee_submissions_status_check
  check (status in ('draft', 'submitted', 'evaluating', 'evaluated', 'error'));
alter table public.ee_submissions add column if not exists evaluation_started_at timestamptz;
alter table public.ee_submissions add column if not exists error_message text;

-- ---- eo_submissions: same lifecycle additions ----
alter table public.eo_submissions drop constraint if exists eo_submissions_status_check;
alter table public.eo_submissions
  add constraint eo_submissions_status_check
  check (status in ('draft', 'submitted', 'evaluating', 'evaluated', 'error'));
alter table public.eo_submissions add column if not exists evaluation_started_at timestamptz;
alter table public.eo_submissions add column if not exists error_message text;

-- ---- Bonus fix found while touching evaluate-eo: Gemini already returns
-- a `recommendations` field (see RESPONSE_SCHEMA in the edge function) but
-- it was never saved — eo_feedback had no column for it, so it was
-- silently discarded on every EO evaluation. ----
alter table public.eo_feedback add column if not exists recommendations text;

-- ---------------------------------------------------------
-- notifications
-- ---------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('eval_success', 'eval_error')),
  title text not null,
  body text,
  link text, -- e.g. '/ee/3' or '/eo/1' — where clicking the notification takes the student
  read boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, read, created_at desc);

alter table public.notifications enable row level security;

create policy "own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "own notifications update" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Inserts are done by the edge functions using the service-role key, which
-- bypasses RLS entirely — no insert policy needed for regular users.

-- Required for the client's Realtime subscription (Topbar notification
-- bell) to receive INSERT events on this table.
alter publication supabase_realtime add table public.notifications;

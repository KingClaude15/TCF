-- =========================================================
-- TCF 41-Day Challenge — Initial schema
-- Run with: supabase db push  (or paste into SQL editor)
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- PROFILES (extends auth.users)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  target_score int default 17,
  theme text default 'light' check (theme in ('light','dark')),
  challenge_start_date date default current_date,
  current_day int default 1 check (current_day between 1 and 41),
  current_streak int default 0,
  longest_streak int default 0,
  last_active_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------
-- DAILY PROGRESS  (one row per user per challenge day 1-41)
-- ---------------------------------------------------------
create table if not exists public.daily_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int not null check (day_number between 1 and 41),
  co_done boolean default false,
  ce_done boolean default false,
  ee_done boolean default false,
  is_complete boolean generated always as (co_done and ce_done and ee_done) stored,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, day_number)
);

-- ---------------------------------------------------------
-- CO RESULTS (Comprehension Orale — 40 series)
-- ---------------------------------------------------------
create table if not exists public.co_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int check (day_number between 1 and 41),
  series_number int not null check (series_number between 1 and 40),
  score numeric(4,1) not null check (score >= 0),
  max_score numeric(4,1) not null default 39,
  time_taken_seconds int,
  difficulty text check (difficulty in ('easy','medium','hard')),
  notes text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- CE RESULTS (Comprehension Ecrite — 40 series)
-- ---------------------------------------------------------
create table if not exists public.ce_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int check (day_number between 1 and 41),
  series_number int not null check (series_number between 1 and 40),
  score numeric(4,1) not null check (score >= 0),
  max_score numeric(4,1) not null default 39,
  time_taken_seconds int,
  difficulty text check (difficulty in ('easy','medium','hard')),
  notes text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- EE SUBMISSIONS (Expression Ecrite — 40 topics)
-- ---------------------------------------------------------
create table if not exists public.ee_submissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int check (day_number between 1 and 41),
  topic_number int not null check (topic_number between 1 and 40),
  prompt text not null,
  draft_content text,
  final_content text,
  word_count int,
  status text default 'draft' check (status in ('draft','submitted','evaluated')),
  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------
-- AI FEEDBACK (one-to-one with an evaluated ee_submission)
-- ---------------------------------------------------------
create table if not exists public.ai_feedback (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references public.ee_submissions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  cefr_level text,
  estimated_score numeric(4,1),
  grammar_feedback text,
  vocabulary_feedback text,
  organization_feedback text,
  task_achievement_feedback text,
  mistakes jsonb default '[]',
  corrected_version text,
  model_answer text,
  vocabulary_suggestions jsonb default '[]',
  recommendations text,
  raw_response jsonb,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- ACHIEVEMENTS (catalog + earned junction)
-- ---------------------------------------------------------
create table if not exists public.achievement_catalog (
  code text primary key,
  title text not null,
  description text,
  icon text default 'award',
  category text
);

create table if not exists public.achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null references public.achievement_catalog(code),
  earned_at timestamptz default now(),
  unique (user_id, code)
);

insert into public.achievement_catalog (code, title, description, icon, category) values
  ('streak_7',  '7-Day Streak',  'Practiced 7 days in a row.', 'flame', 'streak'),
  ('streak_14', '14-Day Streak', 'Practiced 14 days in a row.', 'flame', 'streak'),
  ('streak_21', '21-Day Streak', 'Practiced 21 days in a row.', 'flame', 'streak'),
  ('challenge_complete', '41-Day Finisher', 'Completed all 41 days.', 'trophy', 'milestone'),
  ('co_perfect', 'CO Perfectionist', 'First perfect CO score.', 'headphones', 'performance'),
  ('ce_perfect', 'CE Perfectionist', 'First perfect CE score.', 'book-open', 'performance'),
  ('ee_improve_5', 'Rising Writer', 'EE score improved by 5+ points.', 'trending-up', 'performance')
on conflict (code) do nothing;

-- ---------------------------------------------------------
-- STATISTICS SNAPSHOT (daily rollup for fast chart loads)
-- ---------------------------------------------------------
create table if not exists public.statistics_daily (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stat_date date not null default current_date,
  co_avg numeric(4,1),
  ce_avg numeric(4,1),
  ee_avg numeric(4,1),
  days_completed int default 0,
  created_at timestamptz default now(),
  unique (user_id, stat_date)
);

-- ---------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------
create index if not exists idx_co_results_user on public.co_results(user_id, series_number);
create index if not exists idx_ce_results_user on public.ce_results(user_id, series_number);
create index if not exists idx_ee_submissions_user on public.ee_submissions(user_id, topic_number);
create index if not exists idx_daily_progress_user on public.daily_progress(user_id, day_number);
create index if not exists idx_ai_feedback_submission on public.ai_feedback(submission_id);

-- =========================================================
-- Row Level Security — every table is strictly per-user
-- =========================================================
alter table public.profiles enable row level security;
alter table public.daily_progress enable row level security;
alter table public.co_results enable row level security;
alter table public.ce_results enable row level security;
alter table public.ee_submissions enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.achievements enable row level security;
alter table public.statistics_daily enable row level security;
alter table public.achievement_catalog enable row level security;

create policy "read own profile" on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "own daily_progress" on public.daily_progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own co_results" on public.co_results for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own ce_results" on public.ce_results for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own ee_submissions" on public.ee_submissions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own ai_feedback" on public.ai_feedback for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own achievements" on public.achievements for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own statistics" on public.statistics_daily for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "anyone reads catalog" on public.achievement_catalog for select using (true);

-- =========================================================
-- Trigger: auto-create profile + 41 daily_progress rows on signup
-- =========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.daily_progress (user_id, day_number)
  select new.id, generate_series(1, 41);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- Trigger: keep updated_at fresh
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger trg_ee_updated before update on public.ee_submissions
  for each row execute procedure public.set_updated_at();

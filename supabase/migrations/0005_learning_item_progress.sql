-- =========================================================
-- TCF 41-Day Challenge — Learning Center item progress
-- Run with: supabase db push  (or paste into SQL editor)
--
-- Persists the "known" / "review" state a student sets on each flashcard
-- in the Learning Center, so it survives navigating away, refreshing, or
-- switching devices — instead of resetting every time <FlashcardDeck>
-- remounts (which is what happens with plain useState).
--
-- item_key is a stable, content-derived identifier (see
-- learningCenterService.buildFlashcards, which now emits
-- `${basic}=>${advanced}` lowercased as each card's `key`) rather than an
-- array index, since flashcard order/membership can shift as new EE
-- corrections add more vocabulary.
--
-- item_type is included (not hardcoded to 'flashcard') so the same table
-- can back the correction-drill exercises later without a new migration.
-- =========================================================

create table if not exists public.learning_item_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null default 'flashcard' check (item_type in ('flashcard', 'drill')),
  item_key text not null,
  status text not null check (status in ('known', 'review')),
  updated_at timestamptz default now(),
  unique (user_id, item_type, item_key)
);

create index if not exists idx_learning_item_progress_user
  on public.learning_item_progress(user_id, item_type);

alter table public.learning_item_progress enable row level security;

create policy "own learning_item_progress" on public.learning_item_progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger trg_learning_item_progress_updated before update on public.learning_item_progress
  for each row execute procedure public.set_updated_at();

-- =========================================================
-- Correct EO task durations to match the official TCF Canada
-- Expression Orale timing (12 minutes total), per France Éducation
-- International's published structure:
--   Tâche 1 : entretien dirigé, sans préparation      — 2 min
--   Tâche 2 : interaction avec préparation             — 5 min 30 s
--             (≈2 min préparation + ≈3 min 30 s de parole)
--   Tâche 3 : point de vue, sans préparation            — 4 min 30 s
-- 2 + 5.5 + 4.5 = 12 minutes exactly.
-- =========================================================

-- Add a prep-time column for Tâche 2 (didn't exist before — the app was
-- silently using a hardcoded JS fallback for every sujet regardless of
-- what was actually configured in the database).
alter table public.eo_sujets add column if not exists tache2_prep_seconds int not null default 120;

-- Fix the column defaults for any sujets created from now on.
alter table public.eo_sujets alter column tache1_max_seconds set default 120; -- was 60 (1 min) — should be 2 min
alter table public.eo_sujets alter column tache2_max_seconds set default 210; -- was 120 (2 min) — should be 3 min 30 s of speaking
alter table public.eo_sujets alter column tache3_max_seconds set default 270; -- was 180 (3 min) — should be 4 min 30 s

-- Backfill any sujets that are still sitting at the old (incorrect)
-- default values — this only touches rows that were never customized.
update public.eo_sujets set tache1_max_seconds = 120 where tache1_max_seconds = 60;
update public.eo_sujets set tache2_max_seconds = 210 where tache2_max_seconds = 120;
update public.eo_sujets set tache3_max_seconds = 270 where tache3_max_seconds = 180;

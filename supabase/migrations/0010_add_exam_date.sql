-- =========================================================
-- Add profiles.exam_date
--
-- BUG: Profile.jsx (see updateProfile call in handleSave) has been
-- sending `exam_date` in its PATCH to `profiles` for the new "expected
-- exam date" feature, but no migration ever added this column. PostgREST
-- rejects unknown columns with a 400 Bad Request, which is exactly the
-- error seen when saving the profile after setting an exam date.
--
-- Nullable date, matching the <input type="date"> on the frontend, which
-- sends either a 'YYYY-MM-DD' string or null when cleared.
-- =========================================================

alter table public.profiles add column if not exists exam_date date;

comment on column public.profiles.exam_date is
  'Student-provided expected TCF Canada exam date, used by the AI Progress Coach to compute weeks-remaining and pacing.';

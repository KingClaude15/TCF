-- =========================================================
-- Onboarding flag
--
-- Drives the first-time-user tour (src/components/onboarding/OnboardingTour.jsx):
-- shown once, right after a student's account is approved and they land
-- on the dashboard for the first time.
--
-- Existing users (created before this migration) are backfilled to TRUE —
-- they've already been using the app for a while, so a "welcome tour"
-- popping up out of nowhere would be confusing, not helpful. Only accounts
-- created from now on start at FALSE and see the tour once.
-- =========================================================

alter table public.profiles add column if not exists onboarding_completed boolean;
update public.profiles set onboarding_completed = true where onboarding_completed is null;
alter table public.profiles alter column onboarding_completed set default false;
alter table public.profiles alter column onboarding_completed set not null;

-- =========================================================
-- TCF 41-Day Challenge — Admin read access to exercise activity
--
-- Adds SELECT-only policies so admins/moderators can see every user's
-- CO/CE results and EE submissions+feedback (for the new admin "Activité"
-- panel), without touching the existing per-user RLS policies at all.
-- Postgres RLS policies on the same command are OR'd together, so this is
-- purely additive: a regular student still only ever sees their own rows
-- through the existing "own X" policies; admins get an extra path in.
--
-- Uses the is_admin() helper already defined in 0003_rbac_roles.sql.
-- Run with: supabase db push  (or paste into SQL editor)
-- =========================================================

create policy "admins read all co_results" on public.co_results
  for select using (public.is_admin());

create policy "admins read all ce_results" on public.ce_results
  for select using (public.is_admin());

create policy "admins read all ee_submissions" on public.ee_submissions
  for select using (public.is_admin());

create policy "admins read all ai_feedback" on public.ai_feedback
  for select using (public.is_admin());

-- =========================================================
-- TCF 41-Day Challenge — Fix topic_number range for encoded sujets
--
-- BUG: 0001_init.sql constrains ee_submissions.topic_number to 1-40,
-- which matched the original "40 standalone EE topics" design. The sujets
-- rework (0002 + sujetsService.encodeTopicNumber) now encodes topic_number
-- as `sujetNumber * 10 + taskType`, so any sujet numbered 4 or higher
-- produces a topic_number above 40 (e.g. sujet 4, tâche 1 = 41) and the
-- insert in eeService.saveDraft is rejected by this constraint before the
-- essay ever reaches the evaluate-essay Edge Function.
--
-- Run with: supabase db push  (or paste into SQL editor)
-- =========================================================

alter table public.ee_submissions
  drop constraint if exists ee_submissions_topic_number_check;

-- Generous upper bound (sujets up to #999, 3 tasks each) rather than an
-- exact one, so this doesn't need revisiting again if more sujets are added.
alter table public.ee_submissions
  add constraint ee_submissions_topic_number_check check (topic_number between 1 and 9999);

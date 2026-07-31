-- =========================================================
-- Standardize EO Tâche 1 across all sujets
--
-- TCF Canada's Tâche 1 (Entretien dirigé) is always the same
-- self-introduction task in the real exam, unlike Tâches 2/3 which vary
-- per sujet. The admin form used to let Tâche 1 be typed freely per
-- sujet — this backfills every existing row to the correct, standardized
-- text/duration. Going forward, src/pages/admin/AdminEO.jsx no longer
-- exposes Tâche 1 as editable at all (see src/data/eoConstants.js).
-- =========================================================

update public.eo_sujets
set
  tache1_prompt = $prompt$Présentez-vous de manière structurée. L'examinateur vous invite à parler de vous pendant 2 minutes sans temps de préparation.

Points à aborder :
1. Identité (nom, âge, ville)
2. Formation (études, travail)
3. Loisirs (passions, hobbies)
4. Projets (objectifs, TCF)$prompt$,
  tache1_max_seconds = 120;

-- ---------------------------------------------------------
-- Correct EO task structure to match the verified official TCF Canada
-- format (confirmed via multiple sources, July 2026):
--   Tâche 1 — entretien dirigé, SANS préparation, ~2 min
--   Tâche 2 — le candidat POSE DES QUESTIONS sur une situation donnée,
--             AVEC 2 min de préparation (note-taking) avant de parler
--   Tâche 3 — avis spontané sur UN SEUL sujet/question, SANS préparation
--             et SANS deux points de vue opposés (unlike EE tâche 3)
-- ---------------------------------------------------------

alter table public.eo_sujets add column if not exists tache2_prep_seconds int not null default 120;
alter table public.eo_sujets add column if not exists tache3_topic text;
alter table public.eo_sujets add column if not exists tache3_prep_seconds int not null default 0;

-- Backfill tache3_topic from the old two-viewpoint fields for existing rows,
-- then those old fields are no longer used by the app (left in place rather
-- than dropped, in case of in-flight references — harmless if unused).
update public.eo_sujets
set tache3_topic = coalesce(tache3_topic, tache3_theme || ' — ' || tache3_doc1)
where tache3_topic is null;

alter table public.eo_sujets alter column tache3_topic set not null;

-- Re-seed the 3 starter sujets with a correct Tâche 2 (situational
-- question-asking prompt) and Tâche 3 (single spontaneous-opinion topic).
update public.eo_sujets set
  tache2_prompt = 'Vous cherchez à louer un appartement. Vous avez rendez-vous avec le/la propriétaire. Préparez et posez-lui des questions pour obtenir des informations (loyer, charges, durée du bail, règles de l''immeuble, disponibilité, etc.).',
  tache3_topic = 'Êtes-vous d''accord avec l''affirmation suivante : "Le télétravail devrait devenir la norme pour tous les emplois de bureau" ? Justifiez votre point de vue.'
where sujet_number = 1;

update public.eo_sujets set
  tache2_prompt = 'Vous voulez vous inscrire à un cours de langue dans un centre communautaire. Vous rencontrez la personne responsable des inscriptions. Préparez et posez-lui des questions pour obtenir des informations (horaires, niveaux, prix, matériel nécessaire, etc.).',
  tache3_topic = 'Pensez-vous que l''intelligence artificielle devrait être davantage utilisée dans les écoles ? Justifiez votre point de vue.'
where sujet_number = 2;

update public.eo_sujets set
  tache2_prompt = 'Vous envisagez d''adopter un animal de compagnie et vous visitez un refuge. Préparez et posez des questions à la personne responsable (comportement de l''animal, entretien, coûts, démarches d''adoption, etc.).',
  tache3_topic = 'Les réseaux sociaux font-ils plus de bien que de mal à notre société ? Justifiez votre point de vue.'
where sujet_number = 3;

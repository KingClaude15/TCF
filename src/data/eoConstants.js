// TCF Canada's Tâche 1 (Entretien dirigé) is standardized across every
// sujet in the real exam — it's always the same self-introduction task,
// unlike Tâches 2 and 3 which genuinely vary. This constant is the single
// source of truth for that text; AdminEO.jsx no longer lets it be edited
// per-sujet, and every eo_sujets row is normalized to match it (see
// supabase/migrations/0013_eo_fixed_tache1.sql).
export const EO_TACHE1_FIXED_PROMPT = `Présentez-vous de manière structurée. L'examinateur vous invite à parler de vous pendant 2 minutes sans temps de préparation.

Points à aborder :
1. Identité (nom, âge, ville)
2. Formation (études, travail)
3. Loisirs (passions, hobbies)
4. Projets (objectifs, TCF)`

export const EO_TACHE1_MAX_SECONDS = 120 // 2 minutes, per the official format above

// Tâche 2 (poser des questions) and Tâche 3 (point de vue) timings are
// also fixed by the official TCF Canada format — only the question text
// genuinely varies per sujet. AdminEO.jsx no longer exposes these as
// editable number fields; every sujet is created with these values.
export const EO_TACHE2_PREP_SECONDS = 120 // 2 min preparation
export const EO_TACHE2_MAX_SECONDS = 210 // 3.5 min to speak
export const EO_TACHE3_PREP_SECONDS = 0 // sans préparation
export const EO_TACHE3_MAX_SECONDS = 270 // 4.5 min to speak

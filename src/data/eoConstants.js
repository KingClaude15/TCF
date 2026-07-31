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

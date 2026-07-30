-- ---------------------------------------------------------
-- Support the new "Sujets EO" admin panel (mirrors the existing
-- "Sujets EE" panel). The app has used tache3_topic (single spontaneous
-- opinion prompt) since 0009_fix_eo_task_structure.sql — tache3_theme /
-- tache3_doc1 / tache3_doc2 are legacy two-viewpoint fields that nothing
-- reads anymore (see eoSujetToTasks in sujetsService.js). They were left
-- in place as NOT NULL, which blocks creating a new eo_sujets row from
-- the admin panel without pointlessly filling in dead fields. Relax them.
-- ---------------------------------------------------------
alter table public.eo_sujets alter column tache3_theme drop not null;
alter table public.eo_sujets alter column tache3_doc1 drop not null;
alter table public.eo_sujets alter column tache3_doc2 drop not null;

-- ---------------------------------------------------------
-- Add EO to daily completion tracking (day is now complete once all 4
-- épreuves are done, not just CO/CE/EE). is_complete is a generated
-- column, so it has to be dropped and recreated with the new expression.
-- ---------------------------------------------------------
alter table public.daily_progress add column if not exists eo_done boolean default false;
alter table public.daily_progress drop column if exists is_complete;
alter table public.daily_progress
  add column is_complete boolean generated always as (co_done and ce_done and ee_done and eo_done) stored;
-- Official TCF Canada scoring: weighted /699 points + CECR level for
-- CO/CE, so results reflect the real progressive-difficulty weighting
-- instead of a plain raw-correct-count.
alter table public.co_results add column if not exists weighted_points numeric(4,0);
alter table public.co_results add column if not exists cecr_level text;
alter table public.ce_results add column if not exists weighted_points numeric(4,0);
alter table public.ce_results add column if not exists cecr_level text;

-- ---------------------------------------------------------
-- EO SUJETS (Expression Orale — 3 spoken tasks per sujet, mirrors
-- ee_sujets' shape but with recording time limits instead of word counts)
-- ---------------------------------------------------------
create table if not exists public.eo_sujets (
  id uuid primary key default uuid_generate_v4(),
  sujet_number int unique not null,
  title text,
  tache1_prompt text not null, -- brève présentation / réponse informelle
  tache1_max_seconds int not null default 60,
  tache2_prompt text not null, -- décrire / raconter une expérience
  tache2_max_seconds int not null default 120,
  tache3_theme text not null, -- prise de position / débat
  tache3_doc1 text not null,
  tache3_doc2 text not null,
  tache3_max_seconds int not null default 180,
  is_published boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.eo_sujets enable row level security;

create policy "published eo_sujets are readable" on public.eo_sujets
  for select using (is_published = true or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','super_admin','moderator')
  ));

create policy "admin manage eo_sujets" on public.eo_sujets
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','super_admin'))
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','super_admin'))
  );

-- Seed a few starter sujets so the module has content immediately.
insert into public.eo_sujets (sujet_number, tache1_prompt, tache2_prompt, tache3_theme, tache3_doc1, tache3_doc2) values
(1,
 'Présentez-vous brièvement à l''examinateur : votre nom, votre origine, votre métier ou vos études, et ce que vous aimez faire pendant votre temps libre.',
 'Racontez un voyage ou un déplacement récent qui vous a marqué : où êtes-vous allé(e), avec qui, et qu''est-ce qui a rendu cette expérience mémorable ?',
 'Le télétravail généralisé',
 'De plus en plus d''entreprises adoptent le télétravail à temps plein. Les salariés gagnent du temps de trajet et peuvent mieux organiser leur journée.',
 'Le télétravail généralisé isole les employés et fragilise l''esprit d''équipe. Les échanges informels, souvent à l''origine des meilleures idées, disparaissent.'
),
(2,
 'Décrivez votre quartier ou votre ville à l''examinateur : ce que vous aimez, ce que vous n''aimez pas, et ce qui pourrait être amélioré.',
 'Racontez une expérience professionnelle ou scolaire qui vous a appris quelque chose d''important sur vous-même.',
 'L''intelligence artificielle dans l''éducation',
 'Les outils d''intelligence artificielle permettent d''adapter l''enseignement au rythme de chaque élève et offrent une correction immédiate.',
 'L''usage massif de l''IA à l''école risque d''affaiblir l''esprit critique des élèves, qui s''habituent à obtenir des réponses toutes faites.'
),
(3,
 'Parlez de vos projets pour les prochaines années : professionnels, personnels, ou liés à votre immigration au Canada.',
 'Décrivez une personne qui vous a beaucoup influencé(e) dans votre vie et expliquez pourquoi.',
 'Les réseaux sociaux et la vie privée',
 'Les réseaux sociaux permettent de rester connecté avec ses proches où qu''ils soient et facilitent le partage d''informations utiles en temps réel.',
 'Les réseaux sociaux exposent les utilisateurs à une surveillance constante de leurs données personnelles, souvent revendues à des fins commerciales sans réel consentement.'
);

-- ---------------------------------------------------------
-- EO SUBMISSIONS (Expression Orale — 3 tasks, recorded audio)
-- Mirrors ee_submissions/ai_feedback, but for audio responses.
-- ---------------------------------------------------------
create table if not exists public.eo_submissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int check (day_number between 1 and 41),
  topic_number int not null check (topic_number between 1 and 9999),
  prompt text,
  audio_path text, -- path in the 'eo-recordings' storage bucket
  duration_seconds int,
  status text not null default 'draft' check (status in ('draft','submitted','evaluated')),
  submitted_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, topic_number)
);

create table if not exists public.eo_feedback (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references public.eo_submissions(id) on delete cascade,
  transcript text,
  estimated_score numeric(4,1) check (estimated_score between 0 and 20),
  cefr_level text,
  fluency_feedback text,
  pronunciation_feedback text,
  grammar_feedback text,
  vocabulary_feedback text,
  coherence_feedback text,
  created_at timestamptz default now()
);

alter table public.eo_submissions enable row level security;
alter table public.eo_feedback enable row level security;

create policy "own eo_submissions" on public.eo_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own eo_feedback" on public.eo_feedback
  for all using (
    exists (select 1 from public.eo_submissions s where s.id = submission_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.eo_submissions s where s.id = submission_id and s.user_id = auth.uid())
  );

-- Admins can read everyone's EO activity, same as CO/CE/EE.
create policy "admin read eo_submissions" on public.eo_submissions
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','super_admin','moderator'))
  );

create policy "admin read eo_feedback" on public.eo_feedback
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','super_admin','moderator'))
  );

-- Storage bucket for the recorded audio answers (private — signed URLs only).
insert into storage.buckets (id, name, public)
values ('eo-recordings', 'eo-recordings', false)
on conflict (id) do nothing;

create policy "own eo audio upload" on storage.objects
  for insert with check (bucket_id = 'eo-recordings' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "own eo audio read" on storage.objects
  for select using (bucket_id = 'eo-recordings' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "own eo audio delete" on storage.objects
  for delete using (bucket_id = 'eo-recordings' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "admin read eo audio" on storage.objects
  for select using (
    bucket_id = 'eo-recordings'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','super_admin','moderator'))
  );

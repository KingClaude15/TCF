-- =========================================================
-- CO / CE Question Banks — admin-managed listening & reading
-- exercises, mirroring the ee_sujets pattern.
-- =========================================================

create table if not exists public.co_series (
  id uuid primary key default uuid_generate_v4(),
  series_number int unique not null,
  title text not null,
  audio_url text,
  transcript text,
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  -- questions: [{ "id": "q1", "text": "...", "options": ["a","b","c","d"], "correct_index": 0 }, ...]
  questions jsonb not null default '[]',
  is_published boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ce_series (
  id uuid primary key default uuid_generate_v4(),
  series_number int unique not null,
  title text not null,
  passage_text text not null,
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  questions jsonb not null default '[]',
  is_published boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.co_series enable row level security;
alter table public.ce_series enable row level security;

drop policy if exists "read published co_series" on public.co_series;
create policy "read published co_series" on public.co_series
  for select using (is_published = true or auth.uid() = created_by or public.is_admin());

drop policy if exists "admins manage co_series" on public.co_series;
create policy "admins manage co_series" on public.co_series
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read published ce_series" on public.ce_series;
create policy "read published ce_series" on public.ce_series
  for select using (is_published = true or auth.uid() = created_by or public.is_admin());

drop policy if exists "admins manage ce_series" on public.ce_series;
create policy "admins manage ce_series" on public.ce_series
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_co_series_updated on public.co_series;
create trigger trg_co_series_updated before update on public.co_series
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_ce_series_updated on public.ce_series;
create trigger trg_ce_series_updated before update on public.ce_series
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------
-- Seed: 3 sample CE series so the module isn't empty on first run.
-- (CO needs real audio, so it's left for the admin to populate.)
-- ---------------------------------------------------------
insert into public.ce_series (series_number, title, passage_text, difficulty, questions) values
(1, 'Le télétravail en France',
 'De plus en plus d''entreprises françaises adoptent le télétravail de manière permanente. Selon une étude récente, 40% des salariés du secteur tertiaire travaillent désormais au moins deux jours par semaine depuis chez eux. Les employés apprécient la flexibilité et la réduction du temps de trajet, tandis que certains managers s''inquiètent d''une possible baisse de la cohésion d''équipe. Plusieurs entreprises ont mis en place des journées obligatoires de présence au bureau pour maintenir les liens entre collègues.',
 'easy',
 '[
   {"id":"q1","text":"Combien de salariés du secteur tertiaire télétravaillent au moins deux jours par semaine ?","options":["20%","40%","60%","80%"],"correct_index":1},
   {"id":"q2","text":"Que apprécient les employés dans le télétravail ?","options":["Le salaire","La flexibilité","Les repas gratuits","Les horaires fixes"],"correct_index":1},
   {"id":"q3","text":"Pourquoi certaines entreprises imposent-elles des jours de présence ?","options":["Pour économiser l''électricité","Pour maintenir la cohésion d''équipe","Pour réduire les salaires","Pour améliorer internet"],"correct_index":1}
 ]'::jsonb
),
(2, 'Les circuits courts alimentaires',
 'Les circuits courts, qui limitent le nombre d''intermédiaires entre le producteur et le consommateur, connaissent un succès croissant en France. Marchés de producteurs, paniers bio livrés à domicile, vente directe à la ferme : ces formats séduisent une clientèle soucieuse de traçabilité et de fraîcheur. Toutefois, les prix restent souvent plus élevés que dans la grande distribution, ce qui limite l''accès à ce mode de consommation pour les foyers aux revenus modestes.',
 'medium',
 '[
   {"id":"q1","text":"Qu''est-ce qu''un circuit court ?","options":["Un trajet rapide en voiture","Une vente avec peu d''intermédiaires","Un type de supermarché","Une livraison internationale"],"correct_index":1},
   {"id":"q2","text":"Quel est l''inconvénient principal mentionné ?","options":["Le manque de fraîcheur","Les prix plus élevés","La mauvaise qualité","L''absence de traçabilité"],"correct_index":1}
 ]'::jsonb
),
(3, 'L''intelligence artificielle au travail',
 'L''essor de l''intelligence artificielle transforme profondément le monde professionnel. Si certains métiers risquent d''être automatisés, de nouveaux emplois liés au développement, à la supervision et à l''éthique de ces technologies apparaissent. Les experts recommandent une formation continue des salariés afin qu''ils puissent s''adapter à ces changements plutôt que de les subir. Les entreprises qui investissent dans la formation de leurs équipes constatent généralement une transition plus harmonieuse.',
 'hard',
 '[
   {"id":"q1","text":"Quels nouveaux emplois apparaissent selon le texte ?","options":["Uniquement dans la vente","Liés au développement et à l''éthique de l''IA","Dans l''agriculture","Dans le tourisme"],"correct_index":1},
   {"id":"q2","text":"Que recommandent les experts ?","options":["D''arrêter d''utiliser l''IA","Une formation continue des salariés","De réduire les effectifs","D''ignorer les changements"],"correct_index":1},
   {"id":"q3","text":"Quelles entreprises connaissent une transition plus harmonieuse ?","options":["Celles qui licencient","Celles qui investissent dans la formation","Celles qui ferment","Celles qui ignorent l''IA"],"correct_index":1}
 ]'::jsonb
)
on conflict (series_number) do nothing;

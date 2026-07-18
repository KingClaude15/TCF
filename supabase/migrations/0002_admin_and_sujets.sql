-- =========================================================
-- Admin roles, user approval, and DB-backed EE content
-- =========================================================

-- ---------------------------------------------------------
-- Profiles: role + approval + email (for admin user list)
-- ---------------------------------------------------------
alter table public.profiles add column if not exists role text default 'user' check (role in ('user','admin'));
alter table public.profiles add column if not exists is_approved boolean default true;
alter table public.profiles add column if not exists email text;

-- Backfill email for existing rows
update public.profiles p set email = u.email from auth.users u where p.id = u.id and p.email is null;

-- Keep email populated on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);

  insert into public.daily_progress (user_id, day_number)
  select new.id, generate_series(1, 41);

  return new;
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------
-- is_admin() helper — security definer avoids RLS recursion
-- ---------------------------------------------------------
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- Admins can read/update every profile (needed for the admin user list)
drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles" on public.profiles for select using (public.is_admin());

drop policy if exists "admins update all profiles" on public.profiles;
create policy "admins update all profiles" on public.profiles for update using (public.is_admin());

-- ---------------------------------------------------------
-- EE SUJETS — each sujet bundles Tâche 1, 2, 3. Editable by
-- admins through the admin panel; readable by everyone.
-- ---------------------------------------------------------
create table if not exists public.ee_sujets (
  id uuid primary key default uuid_generate_v4(),
  sujet_number int unique not null,
  title text,
  tache1_prompt text not null,
  tache1_min int not null default 60,
  tache1_max int not null default 120,
  tache2_prompt text not null,
  tache2_min int not null default 120,
  tache2_max int not null default 150,
  tache3_theme text not null,
  tache3_doc1 text not null,
  tache3_doc2 text not null,
  tache3_min int not null default 120,
  tache3_max int not null default 180,
  is_published boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.ee_sujets enable row level security;

drop policy if exists "anyone reads published sujets" on public.ee_sujets;
create policy "anyone reads published sujets" on public.ee_sujets for select using (is_published = true or public.is_admin());

drop policy if exists "admins manage sujets" on public.ee_sujets;
create policy "admins manage sujets" on public.ee_sujets for all using (public.is_admin()) with check (public.is_admin());

create trigger trg_ee_sujets_updated before update on public.ee_sujets
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------
-- Seed the 10 original sujets so the app has content immediately.
-- Edit or add more anytime from the admin panel.
-- ---------------------------------------------------------
insert into public.ee_sujets (sujet_number, tache1_prompt, tache2_prompt, tache3_theme, tache3_doc1, tache3_doc2) values
(1,
 'Vous venez d''emménager dans un nouveau quartier. Écrivez un message à un(e) ami(e) pour décrire votre logement et votre nouveau quartier (pièces, environs, transports).',
 'Vous avez suivi un cours en ligne pour apprendre une nouvelle compétence. Rédigez un article de blog racontant cette expérience : ce que vous avez appris, les difficultés rencontrées et ce que vous en retenez.',
 'Le télétravail généralisé',
 'De plus en plus d''entreprises adoptent le télétravail à temps plein. Les salariés gagnent du temps de trajet et peuvent mieux organiser leur journée. Plusieurs études montrent une hausse de la productivité et une baisse du stress lié aux transports.',
 'Le télétravail généralisé isole les employés et fragilise l''esprit d''équipe. Les échanges informels, souvent à l''origine des meilleures idées, disparaissent. Certains managers constatent aussi une difficulté croissante à évaluer l''engagement réel de leurs équipes.'
),
(2,
 'Un(e) collègue francophone rejoint votre équipe la semaine prochaine. Écrivez-lui un message pour vous présenter et lui expliquer comment se déroule une journée type au bureau.',
 'Vous avez participé à une action bénévole dans votre communauté (nettoyage, collecte, aide aux personnes âgées, etc.). Rédigez un article de blog pour partager cette expérience et encourager vos lecteurs à s''impliquer.',
 'L''intelligence artificielle dans l''éducation',
 'Les outils d''intelligence artificielle permettent d''adapter l''enseignement au rythme de chaque élève. Ils offrent une correction immédiate et libèrent du temps aux enseignants pour un accompagnement plus personnalisé.',
 'L''usage massif de l''IA à l''école risque d''affaiblir l''esprit critique des élèves, qui s''habituent à obtenir des réponses toutes faites. De plus, la fracture numérique entre familles favorisées et défavorisées pourrait s''aggraver.'
),
(3,
 'Vous avez adopté un animal de compagnie récemment. Écrivez un message à un(e) ami(e) pour lui présenter votre nouveau compagnon et raconter les premiers jours ensemble.',
 'Vous avez changé une habitude importante de votre quotidien (alimentation, sport, mode de transport). Rédigez un article de blog expliquant pourquoi et comment vous avez opéré ce changement.',
 'Les compléments alimentaires',
 'Bien utilisés, les compléments alimentaires permettent de pallier certaines carences, notamment chez les personnes ayant un régime restrictif. Ils sont pratiques et facilement accessibles en pharmacie ou en supermarché.',
 'De nombreux compléments alimentaires n''ont pas d''effet démontré scientifiquement et peuvent même présenter des risques en cas de surdosage. Les spécialistes recommandent de privilégier une alimentation équilibrée plutôt que ces produits.'
),
(4,
 'Votre ami(e) cherche une salle de sport dans votre ville. Écrivez-lui un message pour lui recommander celle que vous fréquentez, en donnant des détails utiles (tarifs, horaires, équipements).',
 'Vous avez déménagé dans une nouvelle ville récemment. Rédigez un article de blog racontant votre installation et vos premières impressions.',
 'La semaine de quatre jours',
 'Plusieurs entreprises ayant testé la semaine de quatre jours rapportent une hausse de la motivation et une baisse de l''absentéisme. Les salariés apprécient ce temps supplémentaire pour leur vie personnelle.',
 'Réduire la semaine à quatre jours peut créer une surcharge de travail sur les jours restants et compliquer l''organisation dans les secteurs qui nécessitent une présence continue, comme la santé ou le commerce.'
),
(5,
 'Vous organisez une sortie en groupe ce week-end. Écrivez un message à vos amis pour leur proposer le programme (lieu, heure, activités prévues).',
 'Vous avez assisté à un événement culturel marquant (concert, exposition, festival). Rédigez un article de blog pour en parler et donner votre avis.',
 'Les logements meublés de courte durée (type Airbnb)',
 'La location de courte durée permet à des propriétaires de rentabiliser un bien et offre aux voyageurs plus de flexibilité et de convivialité qu''un hôtel classique.',
 'Dans certains centres-villes, la multiplication des locations de courte durée fait grimper les loyers et réduit l''offre de logements disponibles pour les habitants permanents.'
),
(6,
 'Un ami francophone va visiter votre ville pour la première fois. Écrivez-lui un message pour lui suggérer un itinéraire de découverte sur une journée.',
 'Vous avez commencé un nouveau travail il y a un mois. Rédigez un article de blog pour raconter cette transition professionnelle et ce que vous en avez appris jusqu''à présent.',
 'L''apprentissage d''un instrument de musique à l''âge adulte',
 'Apprendre un instrument à l''âge adulte stimule la mémoire et la concentration. C''est aussi un excellent moyen de gérer le stress et de rencontrer d''autres passionnés lors de cours collectifs.',
 'Beaucoup d''adultes abandonnent rapidement faute de temps pour pratiquer régulièrement. Sans la discipline imposée dès l''enfance, la progression est plus lente, ce qui peut décourager les débutants.'
),
(7,
 'Vous avez trouvé un covoiturage pour un long trajet. Écrivez un message au conducteur/à la conductrice pour confirmer les détails du trajet et poser vos questions.',
 'Vous avez voyagé seul(e) pour la première fois. Rédigez un article de blog sur cette expérience : préparatifs, moments forts, conseils pour d''autres voyageurs solo.',
 'Les compétitions de jeux vidéo (e-sport)',
 'L''e-sport est devenu une discipline reconnue qui développe la réactivité, la stratégie et le travail d''équipe. Il attire aujourd''hui des millions de spectateurs et génère une véritable économie.',
 'La pratique intensive de l''e-sport peut entraîner une sédentarité excessive et des troubles du sommeil chez les jeunes joueurs, sans garantie de débouchés professionnels stables.'
),
(8,
 'Votre appartement a un problème (chauffage, plomberie, etc.). Écrivez un message à votre propriétaire pour décrire le problème et demander une intervention rapide.',
 'Vous avez appris une langue étrangère par vous-même, sans cours formel. Rédigez un article de blog décrivant votre méthode et vos progrès.',
 'La suppression progressive de la monnaie en espèces',
 'Les paiements numériques sont plus rapides, plus sûrs contre le vol, et facilitent le suivi des dépenses personnelles. De nombreux commerces s''orientent déjà vers le tout-numérique.',
 'Supprimer l''argent liquide pénalise les personnes âgées ou peu familières avec la technologie, et pose des questions sur la protection de la vie privée liée au traçage des transactions.'
),
(9,
 'Vous venez de terminer une formation professionnelle. Écrivez un message à un(e) ami(e) pour lui raconter ce que vous avez appris et si vous recommanderiez cette formation.',
 'Vous avez testé le télétravail pendant plusieurs mois. Rédigez un article de blog présentant les avantages et les inconvénients que vous avez constatés.',
 'Les animaux de compagnie au bureau',
 'La présence d''un animal au bureau réduit le stress des employés et améliore l''ambiance générale de l''entreprise, selon plusieurs enquêtes internes menées ces dernières années.',
 'Certains employés se sentent mal à l''aise avec la présence d''animaux au travail, en raison d''allergies ou de peurs, et estiment que cela peut nuire à la concentration collective.'
),
(10,
 'Vous cherchez un(e) colocataire pour votre appartement. Rédigez un message décrivant le logement et le profil de colocataire que vous recherchez.',
 'Vous avez participé à une compétition sportive amateur. Rédigez un article de blog racontant votre préparation et le déroulement de l''événement.',
 'Les maisons de retraite',
 'Les maisons de retraite offrent un environnement sécurisé avec des soins adaptés et des activités qui aident les personnes âgées à rester actives et à éviter l''isolement social.',
 'Certaines familles préfèrent garder leurs proches âgés à la maison, estimant que le soutien à domicile préserve mieux les liens familiaux qu''un placement en établissement.'
)
on conflict (sujet_number) do nothing;

import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import {
  PenLine,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ListChecks,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import clsx from 'clsx'

const SECTIONS = [
  { id: 'intro', label: 'Introduction' },
  { id: 'evaluation', label: 'Évaluation' },
  { id: 'overview', label: 'Vue d’ensemble' },
  { id: 'tache1', label: 'Tâche 1' },
  { id: 'tache2', label: 'Tâche 2' },
  { id: 'tache3', label: 'Tâche 3' },
  { id: 'outils', label: 'Boîte à outils' },
  { id: 'temps', label: 'Gestion du temps' },
  { id: 'erreurs', label: 'Erreurs fréquentes' },
]

function AnchorNav({ active }) {
  return (
    <nav className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-52 shrink-0 overflow-y-auto lg:block">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Sommaire</p>
      <ul className="space-y-1">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={clsx(
                'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                active === s.id
                  ? 'bg-ee-light font-semibold text-ee-dark dark:bg-pink-950 dark:text-pink-300'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              )}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function SectionCard({ id, icon: Icon, title, children, accent = 'ee' }) {
  const accents = {
    ee: 'border-ee-DEFAULT/20 bg-ee-light/40 dark:border-pink-900 dark:bg-pink-950/20',
    brand: 'border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/30',
    amber: 'border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30',
  }
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ee-light text-ee-dark dark:bg-pink-950 dark:text-pink-300">
            <Icon size={18} />
          </div>
        )}
        <h2 className="font-heading text-xl font-bold text-ink-900 dark:text-white">{title}</h2>
      </div>
      <div className={clsx('card space-y-4 border p-5 sm:p-6', accents[accent])}>{children}</div>
    </section>
  )
}

function Checklist({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function PhraseBox({ title, phrases }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-surface-darkCard">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
        {phrases.map((p) => (
          <li key={p} className="rounded-md bg-slate-50 px-3 py-1.5 font-medium dark:bg-slate-800/60">
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function EEMethodologie() {
  const [active] = useState('intro')

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PenLine}
        accent="ee"
        eyebrow="Expression écrite"
        title="Méthodologie — Expression Écrite TCF Canada"
        subtitle="Guide clair des trois tâches, des critères de notation et d’une méthode pour maximiser ton score en 60 minutes."
        right={
          <Link to="/ee" className="btn-primary">
            Pratiquer les sujets <ArrowRight size={16} />
          </Link>
        }
      />

      <div className="flex gap-8">
        <AnchorNav active={active} />

        <div className="min-w-0 flex-1 space-y-10">
          {/* Intro */}
          <SectionCard id="intro" icon={BookOpen} title="Qu’est-ce que l’épreuve d’Expression Écrite ?">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              L’Expression Écrite (EE) est la partie du TCF Canada où tu rédiges trois textes sur ordinateur.
              Tu disposes de <strong>60 minutes au total</strong> pour les trois tâches. Chaque tâche a un
              type de texte, une longueur cible et un niveau de difficulté progressif.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Tâche 1', desc: 'Message / courriel', level: 'A1–A2' },
                { label: 'Tâche 2', desc: 'Article / récit d’expérience', level: 'B1–B2' },
                { label: 'Tâche 3', desc: 'Texte d’opinion', level: 'C1–C2' },
              ].map((t) => (
                <div key={t.label} className="rounded-xl bg-white p-4 shadow-card dark:bg-surface-darkCard">
                  <p className="text-xs font-bold uppercase text-ee-DEFAULT">{t.label}</p>
                  <p className="mt-1 text-sm font-semibold text-ink-900 dark:text-white">{t.desc}</p>
                  <p className="mt-1 text-xs text-slate-500">Niveau visé : {t.level}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Tu n’as pas besoin d’un texte parfait : une <strong>structure claire</strong>, le respect de la
              consigne et une relecture ciblée suffisent pour progresser fortement.
            </p>
          </SectionCard>

          {/* Evaluation */}
          <SectionCard id="evaluation" icon={Target} title="Comment es-tu évalué ?">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              Chaque tâche est notée sur 20 et associée à un niveau CECR (A1 → C2). L’examinateur regarde
              surtout cinq dimensions :
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li>
                <strong>Réalisation de la tâche</strong> — type de texte, destinataire, longueur, consignes.
              </li>
              <li>
                <strong>Organisation</strong> — paragraphes, enchaînement logique, connecteurs.
              </li>
              <li>
                <strong>Vocabulaire</strong> — variété, précision, absence de répétitions inutiles.
              </li>
              <li>
                <strong>Grammaire</strong> — accords, conjugaisons, temps adaptés.
              </li>
              <li>
                <strong>Présentation &amp; registre</strong> — objet/titre, ponctuation, niveau de langue adapté.
              </li>
            </ol>
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm dark:border-brand-900 dark:bg-brand-950/40">
              <p className="font-semibold text-brand-800 dark:text-brand-200">Principe utile</p>
              <p className="mt-1 text-brand-900/80 dark:text-brand-100/80">
                Même sur une tâche « facile », vise un cran au-dessus : un objet soigné, un connecteur juste,
                une phrase de conclusion élégante signalent un meilleur niveau.
              </p>
            </div>
          </SectionCard>

          {/* Overview table */}
          <SectionCard id="overview" icon={ListChecks} title="Vue d’ensemble des trois tâches">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
                    <th className="py-2 pr-4">Tâche</th>
                    <th className="py-2 pr-4">Ce que tu rédiges</th>
                    <th className="py-2 pr-4">Temps conseillé</th>
                    <th className="py-2">Mots (cible)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 font-semibold text-emerald-600">1</td>
                    <td className="py-3">Message / courriel</td>
                    <td className="py-3">~10 min</td>
                    <td className="py-3">60–120 (vise 80–90)</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-amber-600">2</td>
                    <td className="py-3">Article / récit d’expérience</td>
                    <td className="py-3">~18–20 min</td>
                    <td className="py-3">120–150 (vise 135–140)</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-rose-600">3</td>
                    <td className="py-3">Texte d’opinion</td>
                    <td className="py-3">~25–30 min</td>
                    <td className="py-3">120–180 (vise 160–170)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Tâche 1 */}
          <SectionCard id="tache1" icon={PenLine} title="Tâche 1 — Message / courriel">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Situation de la vie courante : inviter, informer, demander, signaler une absence, etc.
              Format attendu : <strong>objet</strong>, formule d’appel, corps, formule de politesse.
            </p>
            <h3 className="text-sm font-bold text-ink-900 dark:text-white">Structure en 7 étapes</h3>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li>Objet clair (sujet du message en quelques mots).</li>
              <li>Formule d’appel adaptée (vous / tu selon le destinataire).</li>
              <li>Phrase d’ouverture polie.</li>
              <li>Objectif du message en une phrase nette.</li>
              <li>Informations essentielles (qui, quoi, où, quand…).</li>
              <li>Phrase de clôture chaleureuse ou utile.</li>
              <li>Formule de politesse finale + signature implicite.</li>
            </ol>
            <div className="grid gap-3 sm:grid-cols-2">
              <PhraseBox
                title="Formules utiles"
                phrases={[
                  'Objet : Invitation / Demande d’information / Absence…',
                  'Madame, Monsieur, / Cher(e)…',
                  'Je vous écris afin de…',
                  'Cordialement, / À bientôt,',
                ]}
              />
              <div>
                <p className="mb-2 text-xs font-bold uppercase text-slate-500">Checklist avant de passer</p>
                <Checklist
                  items={[
                    'Objet renseigné',
                    'Registre adapté (tu / vous)',
                    'Objectif explicite',
                    'Toutes les infos demandées',
                    '60–120 mots',
                    'Accords et ponctuation relus',
                  ]}
                />
              </div>
            </div>
          </SectionCard>

          {/* Tâche 2 */}
          <SectionCard id="tache2" icon={BookOpen} title="Tâche 2 — Article / récit d’expérience">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Court article de type blog : raconter une expérience (formation, voyage, événement) de façon
              vivante, avec titre et paragraphes.
            </p>
            <h3 className="text-sm font-bold text-ink-900 dark:text-white">Structure</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li>
                <strong>Titre accrocheur</strong> — pas un titre plat.
              </li>
              <li>
                <strong>§1 — Contexte</strong> : qui, où, quand, comment.
              </li>
              <li>
                <strong>§2 — Récit</strong> : détails concrets (sensations, faits, émotions).
              </li>
              <li>
                <strong>§3 — Conclusion</strong> : bilan + question ou invitation au lecteur.
              </li>
            </ul>
            <div className="grid gap-3 sm:grid-cols-2">
              <PhraseBox
                title="Connecteurs & formules"
                phrases={[
                  'Chers lecteurs, je voudrais partager…',
                  'D’abord… Ensuite… Enfin…',
                  'En outre / toutefois / par ailleurs',
                  'Et vous, avez-vous déjà… ?',
                ]}
              />
              <div>
                <p className="mb-2 text-xs font-bold uppercase text-slate-500">Checklist</p>
                <Checklist
                  items={[
                    'Titre présent',
                    'Trois paragraphes distincts',
                    'Connecteurs utilisés',
                    'Détails concrets',
                    '120–150 mots',
                    'Relecture faite',
                  ]}
                />
              </div>
            </div>
          </SectionCard>

          {/* Tâche 3 */}
          <SectionCard id="tache3" icon={Sparkles} title="Tâche 3 — Texte d’opinion">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Deux documents aux avis opposés. Tu reformules les deux positions <strong>avec tes propres mots</strong>,
              puis tu défends la tienne avec arguments, exemples et une concession.
            </p>
            <h3 className="text-sm font-bold text-ink-900 dark:text-white">Structure</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li>
                <strong>Titre</strong> souvent sous forme de question.
              </li>
              <li>
                <strong>§1 (court)</strong> — les deux opinions reformulées (≈ 40–60 mots).
              </li>
              <li>
                <strong>§2 (long)</strong> — ton avis, 2–3 arguments illustrés, concession (« Certes… mais… »).
              </li>
            </ul>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40">
              <p className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-200">
                <AlertTriangle size={16} /> Point critique
              </p>
              <p className="mt-1 text-amber-900/80 dark:text-amber-100/80">
                Ne recopie jamais les phrases du sujet. Reformule toujours : la copie fait chuter la note.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <PhraseBox
                title="Formules d’argumentation"
                phrases={[
                  'D’un côté… De l’autre…',
                  'À mon avis / Pour ma part…',
                  'Premièrement… Deuxièmement… Enfin…',
                  'Certes…, mais je reste convaincu(e) que…',
                ]}
              />
              <div>
                <p className="mb-2 text-xs font-bold uppercase text-slate-500">Checklist</p>
                <Checklist
                  items={[
                    'Titre (idéalement question)',
                    'Deux avis reformulés',
                    'Opinion claire + 2–3 arguments',
                    'Concession présente',
                    '120–180 mots',
                    'Connecteurs et relecture',
                  ]}
                />
              </div>
            </div>
          </SectionCard>

          {/* Toolbox */}
          <SectionCard id="outils" icon={ListChecks} title="Boîte à outils — connecteurs" accent="brand">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
                    <th className="py-2 pr-4">Pour…</th>
                    <th className="py-2">Tu peux utiliser…</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    ['Ajouter', 'de plus, en outre, par ailleurs'],
                    ['Illustrer', 'par exemple, notamment, en effet'],
                    ['Opposer', 'cependant, toutefois, néanmoins, en revanche'],
                    ['Nuancer', 'certes… mais, dans une certaine mesure'],
                    ['Conclure', 'en conclusion, en définitive, pour résumer'],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td className="py-2.5 font-medium">{k}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Time */}
          <SectionCard id="temps" icon={Clock} title="Gérer tes 60 minutes">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
                    <th className="py-2 pr-4">Bloc</th>
                    <th className="py-2 pr-4">Temps</th>
                    <th className="py-2">Mots à viser</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2.5">Tâche 1</td>
                    <td className="py-2.5">~10 min</td>
                    <td className="py-2.5">80–90</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">Tâche 2</td>
                    <td className="py-2.5">~18–20 min</td>
                    <td className="py-2.5">135–140</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">Tâche 3</td>
                    <td className="py-2.5">~25–30 min</td>
                    <td className="py-2.5">160–170</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">Relecture finale</td>
                    <td className="py-2.5">~3–5 min</td>
                    <td className="py-2.5">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Ne bloque pas trop longtemps sur la Tâche 1 : c’est la Tâche 3 qui pèse le plus sur l’impression
              de niveau.
            </p>
          </SectionCard>

          {/* Errors */}
          <SectionCard id="erreurs" icon={AlertTriangle} title="Cinq erreurs qui coûtent cher" accent="amber">
            <Checklist
              items={[
                'Oublier l’objet ou le titre',
                'Recopier le texte du sujet (plagiat)',
                'Dépasser largement le maximum de mots',
                'Écrire un seul bloc sans paragraphes',
                'Ne pas relire (accords, accents, ponctuation)',
              ]}
            />
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/ee" className="btn-primary">
                Passer à la pratique EE
              </Link>
              <Link to="/learning-center" className="btn-secondary">
                Centre d’apprentissage
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

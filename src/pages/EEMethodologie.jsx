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
  Wrench,
} from 'lucide-react'
import clsx from 'clsx'

const TABS = [
  { id: 'presentation', label: 'Présentation du test' },
  { id: 'tache1', label: 'Tâche 01' },
  { id: 'tache2', label: 'Tâche 02' },
  { id: 'tache3', label: 'Tâche 03' },
  { id: 'outils', label: 'La boîte à outils' },
]

function TabBar({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {TABS.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              'rounded-2xl px-4 py-2.5 text-xs font-bold uppercase tracking-wide shadow-sm transition-all sm:px-5 sm:text-sm',
              isActive
                ? 'bg-gradient-to-r from-brand-700 to-brand-500 text-white shadow-md'
                : 'border border-slate-100 bg-white text-brand-800 hover:border-brand-200 hover:bg-brand-50 dark:border-slate-700 dark:bg-surface-darkCard dark:text-slate-200 dark:hover:bg-slate-800'
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
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

function InfoGrid({ rows }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="rounded-xl bg-white/80 px-4 py-3 dark:bg-surface-darkCard">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{k}</p>
          <p className="mt-0.5 text-sm font-semibold text-ink-900 dark:text-white">{v}</p>
        </div>
      ))}
    </div>
  )
}

function PresentationPanel() {
  return (
    <div className="space-y-6">
      <div className="card space-y-4 p-5 sm:p-6">
        <h2 className="font-heading text-xl font-bold text-ink-900 dark:text-white">
          Méthodologie — Expression Écrite du TCF
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Si tu n’as jamais passé le TCF ou que tu découvres l’expression écrite, ce guide t’explique l’épreuve
          étape par étape. À la fin, tu sauras quoi écrire, dans quel ordre, et comment viser le maximum de points.
        </p>
      </div>

      <div className="card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-ee-DEFAULT" />
          <h3 className="font-heading text-lg font-bold">Qu’est-ce que l’épreuve d’Expression Écrite ?</h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          L’Expression Écrite (EE) est la partie du TCF où tu rédiges toi-même des textes, sur ordinateur. Tu as
          <strong> trois tâches</strong> et <strong>60 minutes au total</strong>. Chaque texte est court (environ
          60 à 180 mots selon la tâche).
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>Tâche 1</strong> — la plus accessible : un message court (courriel).
          </li>
          <li>
            <strong>Tâche 2</strong> — niveau intermédiaire : un article qui raconte une expérience.
          </li>
          <li>
            <strong>Tâche 3</strong> — la plus exigeante : un texte où tu exprimes et défends une opinion.
          </li>
        </ul>
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm dark:border-brand-900 dark:bg-brand-950/40">
          <p className="font-semibold text-brand-800 dark:text-brand-200">Point important</p>
          <p className="mt-1 text-brand-900/80 dark:text-brand-100/80">
            Tu n’as pas besoin d’un texte parfait. Une méthode claire, le respect de la consigne et une relecture
            ciblée font déjà la différence.
          </p>
        </div>
      </div>

      <div className="card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-ee-DEFAULT" />
          <h3 className="font-heading text-lg font-bold">Comment es-tu évalué ?</h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Chaque tâche reçoit une note sur 20 et un niveau CECR (A1 débutant → C2 expert). L’examinateur contrôle
          surtout cinq points :
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>Réalisation de la tâche (type de texte, destinataire, longueur, consignes).</li>
          <li>Organisation (paragraphes, enchaînement, mots de liaison).</li>
          <li>Vocabulaire (variété, précision, peu de répétitions).</li>
          <li>Grammaire (accords, verbes, temps).</li>
          <li>Présentation et registre (objet ou titre, ponctuation, niveau de langue adapté).</li>
        </ol>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong>A1–A2</strong> = débutant, <strong>B1–B2</strong> = intermédiaire, <strong>C1–C2</strong> = avancé.
          L’objectif est d’atteindre le niveau le plus élevé possible.
        </p>
      </div>

      <div className="card space-y-3 p-5 sm:p-6">
        <h3 className="font-heading text-lg font-bold">Viser un niveau au-dessus</h3>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Même sur une tâche « facile », un objet soigné, un bon connecteur ou une conclusion élégante signalent un
          meilleur niveau. Sur chaque tâche, ajoute au moins un de ces détails.
        </p>
      </div>

      <div className="card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <ListChecks size={18} className="text-ee-DEFAULT" />
          <h3 className="font-heading text-lg font-bold">Vue d’ensemble des trois tâches</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
                <th className="py-2 pr-4">Tâche</th>
                <th className="py-2 pr-4">Ce que tu rédiges</th>
                <th className="py-2 pr-4">Temps</th>
                <th className="py-2">Mots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-3 font-semibold text-emerald-600">1</td>
                <td className="py-3">Courriel / message</td>
                <td className="py-3">~10 min</td>
                <td className="py-3">60–120 (vise 80–90)</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-amber-600">2</td>
                <td className="py-3">Article de blog</td>
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
      </div>
    </div>
  )
}

function Tache1Panel() {
  return (
    <div className="space-y-6">
      <div className="card space-y-4 border-emerald-200/60 p-5 sm:p-6 dark:border-emerald-900">
        <h2 className="font-heading text-xl font-bold text-emerald-700 dark:text-emerald-300">
          Tâche 1 — Le courriel (e-mail)
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Situation de la vie courante : inviter, informer, demander, signaler une absence, répondre à un message.
          C’est la tâche la plus simple — ne lui consacre pas trop de temps.
        </p>
        <InfoGrid
          rows={[
            ['Ce que tu rédiges', 'Un courriel (e-mail)'],
            ['Longueur', '60–120 mots (conseil : 80–90)'],
            ['Temps conseillé', 'Environ 10 minutes'],
            ['Niveau évalué', 'A1–A2 (le plus accessible)'],
          ]}
        />
      </div>

      <div className="card space-y-4 p-5 sm:p-6">
        <h3 className="font-heading text-base font-bold">Ce que l’examinateur vérifie</h3>
        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <p>
            <strong>a) Format du courriel</strong> — objet, formule d’appel, corps, formule de politesse finale.
          </p>
          <p>
            <strong>b) Niveau de langue</strong> — « vous » (formel) avec un inconnu / un supérieur ; « tu »
            (informel) avec un ami. Évite le langage trop familier.
          </p>
          <p>
            <strong>c) Objectif clair</strong> — dès le début, indique pourquoi tu écris (inviter, demander, etc.).
          </p>
          <p>
            <strong>d) Toutes les informations</strong> — lieu, date, heure, etc. selon la consigne.
          </p>
        </div>
      </div>

      <div className="card space-y-4 p-5 sm:p-6">
        <h3 className="font-heading text-base font-bold">Structure étape par étape</h3>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>Objet (sujet du message en quelques mots).</li>
          <li>Formule d’appel adaptée au destinataire.</li>
          <li>Phrase d’ouverture polie.</li>
          <li>Objectif du message en une phrase nette.</li>
          <li>Informations essentielles (qui, quoi, où, quand…).</li>
          <li>Phrase de clôture chaleureuse ou utile.</li>
          <li>Formule de politesse finale.</li>
        </ol>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PhraseBox
          title="Phrases prêtes à l’emploi"
          phrases={[
            'Madame, Monsieur, / Chers collègues, / Salut…',
            'J’espère que vous allez bien.',
            'Je vous écris afin de… / Je vous invite à…',
            'Cordialement, / À bientôt,',
            'Je me permets de vous écrire afin de… (niveau +)',
          ]}
        />
        <div className="card space-y-3 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Avant de passer à la suite</p>
          <Checklist
            items={[
              'Objet renseigné',
              'Bon registre (tu / vous)',
              'Objectif explicite',
              'Toutes les infos demandées',
              'Formule de politesse',
              '60–120 mots + relecture',
            ]}
          />
        </div>
      </div>

      <div className="card space-y-3 border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800 dark:text-amber-200">
          <AlertTriangle size={16} /> Erreurs à éviter
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900/90 dark:text-amber-100/80">
          <li>Oublier l’objet</li>
          <li>Se tromper de registre (tu / vous)</li>
          <li>Dépasser 120 mots et perdre du temps pour les tâches 2 et 3</li>
        </ul>
        <p className="text-sm text-amber-900/90 dark:text-amber-100/80">
          <strong>Conseil :</strong> reste court (80–90 mots) et termine par une phrase chaleureuse.
        </p>
      </div>
    </div>
  )
}

function Tache2Panel() {
  return (
    <div className="space-y-6">
      <div className="card space-y-4 border-amber-200/60 p-5 sm:p-6 dark:border-amber-900">
        <h2 className="font-heading text-xl font-bold text-amber-700 dark:text-amber-300">
          Tâche 2 — L’article de blog
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Rédige un court article qui raconte une expérience (voyage, formation, sortie…) de façon vivante, pour
          des lecteurs.
        </p>
        <InfoGrid
          rows={[
            ['Ce que tu rédiges', 'Un article de blog'],
            ['Longueur', '120–150 mots (vise 135–140)'],
            ['Temps conseillé', 'Environ 18 à 20 minutes'],
            ['Niveau évalué', 'B1–B2 (intermédiaire)'],
          ]}
        />
      </div>

      <div className="card space-y-4 p-5 sm:p-6">
        <h3 className="font-heading text-base font-bold">Ce que l’examinateur vérifie</h3>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>Titre accrocheur</strong> — donne envie de lire.
          </li>
          <li>
            <strong>Paragraphes</strong> — pas un seul bloc de texte.
          </li>
          <li>
            <strong>Connecteurs</strong> — d’abord, ensuite, en outre, toutefois, enfin…
          </li>
          <li>
            <strong>Récit vivant</strong> — détails concrets, émotions, question au lecteur en fin de texte.
          </li>
        </ul>
      </div>

      <div className="card space-y-4 p-5 sm:p-6">
        <h3 className="font-heading text-base font-bold">Structure</h3>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>Titre</strong> qui attire l’attention.
          </li>
          <li>
            <strong>§1 — Contexte</strong> : qui, où, quand, comment.
          </li>
          <li>
            <strong>§2 — Récit</strong> : détails, sensations, faits marquants.
          </li>
          <li>
            <strong>§3 — Conclusion</strong> : bilan + question ou invitation au lecteur.
          </li>
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PhraseBox
          title="Phrases utiles"
          phrases={[
            'Chers lecteurs, je voudrais partager avec vous…',
            'En outre / toutefois / par ailleurs…',
            'Ce qui m’a le plus marqué(e), c’est…',
            'Et vous, avez-vous déjà vécu… ?',
            'Cette expérience m’a montré que…',
          ]}
        />
        <div className="card space-y-3 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Checklist</p>
          <Checklist
            items={[
              'Titre présent',
              'Trois paragraphes',
              'Connecteurs utilisés',
              'Détails concrets',
              'Question / réflexion finale',
              '120–150 mots + relecture',
            ]}
          />
        </div>
      </div>

      <div className="card space-y-2 border-amber-200 bg-amber-50/50 p-5 text-sm dark:border-amber-900 dark:bg-amber-950/30">
        <p className="font-semibold text-amber-800 dark:text-amber-200">Erreurs fréquentes</p>
        <ul className="list-disc space-y-1 pl-5 text-amber-900/90 dark:text-amber-100/80">
          <li>Tout écrire d’un seul bloc</li>
          <li>Oublier le titre</li>
          <li>Récit plat, sans détails ni conclusion personnelle</li>
        </ul>
        <p className="text-amber-900/90 dark:text-amber-100/80">
          <strong>Astuce :</strong> une phrase de type « Cette expérience m’a appris que… » mature le texte.
        </p>
      </div>
    </div>
  )
}

function Tache3Panel() {
  return (
    <div className="space-y-6">
      <div className="card space-y-4 border-rose-200/60 p-5 sm:p-6 dark:border-rose-900">
        <h2 className="font-heading text-xl font-bold text-rose-700 dark:text-rose-300">
          Tâche 3 — Le texte d’opinion
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Deux documents présentent des avis opposés sur un sujet de société. Tu reformules les deux positions,
          puis tu défends la tienne avec arguments et exemples. C’est la tâche la plus difficile — et celle qui
          pèse le plus sur l’impression de niveau.
        </p>
        <InfoGrid
          rows={[
            ['Ce que tu rédiges', 'Un texte d’opinion / argumentatif'],
            ['Longueur', '120–180 mots (vise 160–170)'],
            ['Temps conseillé', 'Environ 25 à 30 minutes'],
            ['Niveau évalué', 'C1–C2 (le plus élevé)'],
          ]}
        />
      </div>

      <div className="card space-y-4 p-5 sm:p-6">
        <h3 className="font-heading text-base font-bold">Ce que l’examinateur vérifie</h3>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>Reformulation</strong> des deux avis avec tes propres mots (jamais de copie du sujet).
          </li>
          <li>
            <strong>Opinion claire</strong> (« À mon avis… », « Pour ma part… »).
          </li>
          <li>
            <strong>Arguments illustrés</strong> (expérience, chiffre, exemple de société).
          </li>
          <li>
            <strong>Concession</strong> (« Certes…, mais… ») pour nuancer.
          </li>
          <li>
            <strong>Connecteurs</strong> pour structurer le raisonnement.
          </li>
        </ul>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm dark:border-rose-900 dark:bg-rose-950/40">
          <p className="font-semibold text-rose-800 dark:text-rose-200">Point critique</p>
          <p className="mt-1 text-rose-900/80 dark:text-rose-100/80">
            Recopier les phrases du sujet = plagiat et note basse. Lis, comprends, reformule en une ou deux
            phrases par idée.
          </p>
        </div>
      </div>

      <div className="card space-y-4 p-5 sm:p-6">
        <h3 className="font-heading text-base font-bold">Structure</h3>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>Titre</strong> souvent sous forme de question.
          </li>
          <li>
            <strong>§1 (court)</strong> — les deux opinions reformulées (≈ 40–60 mots).
          </li>
          <li>
            <strong>§2 (long)</strong> — ton avis, 2–3 arguments avec exemples, concession finale.
          </li>
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PhraseBox
          title="Formules d’argumentation"
          phrases={[
            'D’un côté… De l’autre…',
            'À mon avis… / Pour ma part…',
            'Premièrement… Deuxièmement… Enfin…',
            'Certes…, mais je reste convaincu(e) que…',
            'Bien que cet argument soit recevable… (niveau +)',
          ]}
        />
        <div className="card space-y-3 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Checklist</p>
          <Checklist
            items={[
              'Titre (idéalement question)',
              'Deux avis reformulés',
              'Opinion + 2–3 arguments',
              'Concession présente',
              'Connecteurs',
              '120–180 mots + relecture',
            ]}
          />
        </div>
      </div>

      <div className="card space-y-2 p-5 text-sm">
        <p className="font-semibold text-ink-900 dark:text-white">Détail qui fait gagner des points</p>
        <p className="text-slate-700 dark:text-slate-300">
          Une concession avec subjonctif (« Bien que cet argument soit recevable… ») signale souvent un
          niveau avancé. Varie aussi les connecteurs pour éviter les répétitions.
        </p>
      </div>
    </div>
  )
}

function OutilsPanel() {
  return (
    <div className="space-y-6">
      <div className="card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Wrench size={18} className="text-brand-600" />
          <h2 className="font-heading text-xl font-bold">La boîte à outils</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Connecteurs à varier selon l’usage (évite de toujours répéter les mêmes) :
        </p>
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
                ['Ajouter une idée', 'de plus, en outre, par ailleurs'],
                ['Donner un exemple', 'par exemple, notamment, en effet'],
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
      </div>

      <div className="card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-brand-600" />
          <h3 className="font-heading text-lg font-bold">Gérer tes 60 minutes</h3>
        </div>
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
                <td className="py-2.5">Relecture</td>
                <td className="py-2.5">~3–5 min</td>
                <td className="py-2.5">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card space-y-3 border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
        <p className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-200">
          <AlertTriangle size={16} /> Cinq erreurs qui coûtent cher
        </p>
        <Checklist
          items={[
            'Oublier le titre ou l’objet',
            'Recopier le texte du sujet',
            'Dépasser largement le maximum de mots',
            'Écrire un seul bloc sans paragraphes',
            'Ne pas relire (accords, accents, ponctuation)',
          ]}
        />
      </div>

      <div className="card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-brand-600" />
          <h3 className="font-heading text-lg font-bold">Comment t’entraîner</h3>
        </div>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>Mémorise les 3 structures (courriel 7 étapes, article 3 paragraphes, opinion 2 paragraphes).</li>
          <li>Entraîne-toi chronométré sur les 3 tâches d’affilée, comme à l’examen.</li>
          <li>Priorise la Tâche 3 : un sujet d’opinion régulier fait progresser plus vite.</li>
          <li>Prépare une petite réserve : 5 connecteurs, 3 formules de courriel, 2 tournures « niveau + ».</li>
          <li>Relis toujours avec la checklist de chaque tâche.</li>
        </ul>
        <div className="rounded-xl bg-brand-50 p-4 text-sm dark:bg-brand-950/40">
          <p className="font-semibold text-brand-800 dark:text-brand-200">À retenir</p>
          <p className="mt-1 text-brand-900/80 dark:text-brand-100/80">
            Structure claire + langue variée + une belle tournure + relecture = impression de maîtrise (effet
            C1/C2).
          </p>
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link to="/ee" className="btn-primary">
            Pratiquer les sujets EE <ArrowRight size={16} />
          </Link>
          <Link to="/learning-center" className="btn-secondary">
            Centre d’apprentissage
          </Link>
        </div>
      </div>
    </div>
  )
}

const PANELS = {
  presentation: PresentationPanel,
  tache1: Tache1Panel,
  tache2: Tache2Panel,
  tache3: Tache3Panel,
  outils: OutilsPanel,
}

export default function EEMethodologie() {
  const [tab, setTab] = useState('presentation')
  const Panel = PANELS[tab]

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PenLine}
        accent="ee"
        eyebrow="Expression écrite"
        title="Méthodologie EE"
        subtitle="Guide des trois tâches, des critères de notation et d’une méthode pour maximiser ton score en 60 minutes."
        right={
          <Link to="/ee" className="btn-primary hidden sm:inline-flex">
            Pratiquer <ArrowRight size={16} />
          </Link>
        }
      />

      <TabBar active={tab} onChange={setTab} />

      <div className="animate-fadeIn">
        <Panel />
      </div>
    </div>
  )
}

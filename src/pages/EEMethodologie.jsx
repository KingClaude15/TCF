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
          Tâche 1 — Message (courriel / message)
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Rédaction d&apos;un message pour décrire, raconter et/ou expliquer, adressé à un ou plusieurs destinataires
          dont le statut a été précisé dans la consigne.
        </p>
        <InfoGrid
          rows={[
            ['Objectif', 'Décrire, raconter et/ou expliquer'],
            ['Format', 'Message / courriel adapté au destinataire'],
            ['Longueur', '60–120 mots'],
            ['Temps conseillé', 'Environ 10 minutes'],
          ]}
        />
      </div>

      <div className="card space-y-5 p-5 sm:p-6">
        <h3 className="font-heading text-base font-bold">Méthodologie étape par étape</h3>

        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">1. Salutation</p>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              Salue de manière appropriée le ou les destinataires du message (tu / vous selon la relation).
            </p>
            <PhraseBox
              title="Exemples"
              phrases={[
                "Bonjour chers amis, j'espère que vous vous portez bien !",
                "Bonjour Francis, j'espère que tu vas bien !",
                'Bonjour, Monsieur.',
              ]}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">2. Introduction</p>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              Présente l&apos;objet du message de façon claire. L&apos;introduction doit répondre à :{' '}
              <em>« Pourquoi j&apos;écris ce message / ce courriel ? »</em>
            </p>
            <PhraseBox
              title="Exemples"
              phrases={[
                "Je suis ravi de te donner des infos sur nos nouveaux locaux. Nous avons déménagé au 15 rue des Entrepreneurs, en plein centre-ville.",
                "Je t'écris car je viens enfin de signer le bail pour mon nouvel appartement !",
              ]}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">3. Corps du message</p>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              Fournis les informations demandées : décrire, raconter ou expliquer avec un langage clair adapté à la
              consigne. Organise le développement en <strong>au plus 3 parties</strong> selon la structure :
            </p>
            <div className="mb-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800 dark:bg-brand-950/40 dark:text-brand-200">
              CONNECTEUR LOGIQUE + INFORMATION + COMMENTAIRE
            </div>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li>
                Le connecteur logique est précédé d&apos;un point et suivi d&apos;une virgule (ex. :{' '}
                <em>Tout d&apos;abord, … Ensuite, … Enfin, …</em>).
              </li>
              <li>
                Pour le commentaire, privilégie le <strong>futur simple</strong> ou le <strong>conditionnel</strong>{' '}
                lorsque la structure de la phrase le permet.
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">4. Conclusion (prise de congé)</p>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              Termine de façon courtoise, avec une phrase qui crée un lien avec le destinataire, puis une formule de
              politesse.
            </p>
            <PhraseBox
              title="Exemple"
              phrases={[
                "Si tu avais un moment de libre le week-end prochain, j'aimerais beaucoup te montrer les lieux. J'espère que tu pourras venir ! À très vite,",
              ]}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">5. Signature</p>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              Ajoute ton prénom à la fin pour une identification claire et personnelle.
            </p>
            <PhraseBox title="Exemples" phrases={['Claude.', 'Mark.']} />
          </div>
        </div>
      </div>

      <div className="card space-y-3 p-5 sm:p-6">
        <h3 className="font-heading text-base font-bold">Pour maximiser ta note</h3>
        <Checklist
          items={[
            'Majuscule en début de phrase et pour les noms propres',
            'Éviter les répétitions — vocabulaire riche et adapté',
            'Utiliser conditionnel / subjonctif quand c’est pertinent (effet niveau +)',
            'Plusieurs paragraphes et ponctuation soignée (détail C1/C2)',
            'Respecter la fourchette 60–120 mots',
          ]}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/ee" className="btn-primary">
          Pratiquer la Tâche 1 <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}

function Tache2Panel() {
  return (
    <div className="space-y-6">
      <div className="card space-y-4 border-sky-200/60 p-5 sm:p-6 dark:border-sky-900">
        <h2 className="font-heading text-xl font-bold text-sky-700 dark:text-sky-300">
          Tâche 2 — Article / compte rendu d&apos;expérience
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Rédaction d&apos;un article, d&apos;un courrier ou d&apos;une note à l&apos;attention de plusieurs
          destinataires pour faire un compte rendu d&apos;expérience ou un récit (souvent un article de blog).
        </p>
        <InfoGrid
          rows={[
            ['Objectif', 'Raconter une expérience / faire un compte rendu'],
            ['Format fréquent', 'Article de blog'],
            ['Longueur', '120–150 mots'],
            ['Temps conseillé', 'Environ 18–20 minutes'],
          ]}
        />
        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
          <p className="font-semibold text-ink-900 dark:text-white">C&apos;est quoi un article de blog ?</p>
          <p className="mt-1.5 leading-relaxed">
            Un contenu publié en ligne, souvent plus décontracté qu&apos;un article de presse : nouvelles, conseils,
            opinions, histoires personnelles… Il vise à partager une expérience, interagir avec les lecteurs et
            donner envie de lire jusqu&apos;au bout.
          </p>
        </div>
      </div>

      <div className="card space-y-5 p-5 sm:p-6">
        <h3 className="font-heading text-base font-bold">Structure de l&apos;article de blog</h3>

        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">1. Titre (obligatoire)</p>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              Titre accrocheur en <strong>phrase nominale</strong> (sans verbe conjugué). Si tu n&apos;as pas d&apos;idée
              au début, laisse un espace et reviens-y à la fin.
            </p>
            <PhraseBox
              title="Exemples"
              phrases={[
                "Plongée au cœur de l'enseignement dématérialisé",
                'Un semestre hors du commun',
                'Découverte de la danse salsa',
              ]}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">2. Salutation</p>
            <PhraseBox
              title="Exemples"
              phrases={[
                "Bonjour à toutes et à tous, j'espère que vous vous portez bien.",
                'Chers internautes,',
                'Chers lecteurs,',
              ]}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">3. Introduction et annonce</p>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              Premier paragraphe : présente de façon concise et attractive l&apos;activité ou l&apos;expérience
              (qui ? quoi ? quand ? où ?).
            </p>
            <PhraseBox
              title="Exemples"
              phrases={[
                "Après des années en ville, j'ai décidé de m'installer à la campagne pour une meilleure qualité de vie…",
                "Le week-end dernier, j'ai assisté à un événement sportif mémorable : la finale de la Coupe de football de notre ville…",
                "Samedi dernier, j'ai participé à une journée de nettoyage de la forêt boréale dans le nord de la ville d'Ontario.",
              ]}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">4. Développement</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Répond à la question <em>« comment ? »</em> : raconte ce que tu as fait, vu, entendu et retenu ; précise
              ce qui a (ou non) suscité ton intérêt. Utilise la <strong>1<sup>re</sup> personne</strong> (
              <em>j&apos;ai</em>, <em>je</em>).
            </p>
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">5. Recommandation</p>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              Propose une recommandation liée à l&apos;expérience vécue.
            </p>
            <PhraseBox
              title="Exemple"
              phrases={[
                "Ainsi, chers étudiants lecteurs, je vous recommande vivement de vous inscrire dans une université canadienne afin de bénéficier d'un cursus de qualité et d'acquérir des connaissances précieuses.",
              ]}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">6. Remerciement (facultatif)</p>
            <PhraseBox
              title="Exemple"
              phrases={[
                "Enfin, je tiens à vous remercier d'avoir consacré un peu de votre temps et je vous souhaite une excellente journée.",
              ]}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">7. Politesse et signature</p>
            <PhraseBox
              title="Exemple"
              phrases={['À très bientôt,', 'Votre fidèle blogueuse !', 'Cordialement, Claudine.']}
            />
          </div>
        </div>
      </div>

      <div className="card space-y-3 p-5 sm:p-6">
        <h3 className="font-heading text-base font-bold">Checklist Tâche 2</h3>
        <Checklist
          items={[
            'Titre nominal accrocheur',
            'Salutation adaptée aux lecteurs',
            'Introduction qui pose le cadre (qui / quoi / quand / où)',
            'Développement à la 1re personne avec détails concrets',
            'Recommandation claire',
            '120–150 mots, paragraphes distincts',
          ]}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/ee" className="btn-primary">
          Pratiquer la Tâche 2 <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}

function Tache3Panel() {
  return (
    <div className="space-y-6">
      <div className="card space-y-4 border-violet-200/60 p-5 sm:p-6 dark:border-violet-900">
        <h2 className="font-heading text-xl font-bold text-violet-700 dark:text-violet-300">
          Tâche 3 — Texte d&apos;opinion (deux documents)
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          On te donne <strong>deux documents</strong> (deux opinions sur un fait de société). Tu rédiges un court
          article qui les compare et dans lequel tu <strong>prends position</strong> clairement.
        </p>
        <InfoGrid
          rows={[
            ['Objectif', 'Comparer 2 points de vue + prendre position'],
            ['Documents', '2 textes courts (~90 mots chacun)'],
            ['Longueur totale', '120–180 mots'],
            ['Temps conseillé', 'Environ 25–30 minutes'],
            [
              'Répartition conseillée',
              'Partie 1 (synthèse) : 40–60 mots · Partie 2 (opinion) : 80–120 mots',
            ],
          ]}
        />
      </div>

      <div className="card space-y-5 p-5 sm:p-6">
        <h3 className="font-heading text-base font-bold">Méthodologie</h3>

        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">1. Titre (facultatif)</p>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              Titre accrocheur en <strong>phrase nominale</strong> (sans verbe conjugué), qui résume l&apos;idée
              générale des deux documents.
            </p>
            <PhraseBox title="Exemple" phrases={["Impact de l'amitié au travail"]} />
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">
              2. Premier paragraphe — Introduction / synthèse (40–60 mots)
            </p>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              Présente le débat et résume fidèlement les deux documents <em>avec tes propres mots</em> (ne copie pas
              le sujet).
            </p>
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/40">
              <p className="font-semibold text-slate-500">Silhouettes possibles</p>
              <p className="text-slate-700 dark:text-slate-300">
                De nos jours, le débat sur [idée générale] divise l&apos;opinion publique. Certaines personnes pensent
                que [résumé doc. 1]. Alors que d&apos;autres pensent que [résumé doc. 2].
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Aujourd&apos;hui, la question sur [idée générale] divise l&apos;opinion publique. Selon [auteur 1],
                [résumé doc. 1]. Quant à [auteur 2], [résumé doc. 2].
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Selon le premier document, [résumé doc. 1]. Le second document, quant à lui, souligne que [résumé
                doc. 2].
              </p>
            </div>
            <div className="mt-3">
              <PhraseBox
                title="Exemple complet"
                phrases={[
                  "La question de la gratuité des musées suscite des débats passionnés. Certaines personnes soulignent les risques d'une forte fréquentation et l'épuisement des ressources financières. Par contre, d'autres disent que la gratuité favorise un accès à la culture pour le plus grand nombre…",
                ]}
              />
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-ink-900 dark:text-white">
              3. Deuxième paragraphe — Argumentation (80–120 mots)
            </p>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              <strong>Ta position</strong> + <strong>1 à 2 arguments</strong> + <strong>1 limite / nuance</strong>
            </p>
            <div className="space-y-2 rounded-xl border border-violet-100 bg-violet-50/80 p-4 text-sm dark:border-violet-900 dark:bg-violet-950/30">
              <p className="font-semibold text-violet-800 dark:text-violet-200">Silhouette</p>
              <ul className="list-disc space-y-1.5 pl-4 text-slate-700 dark:text-slate-300">
                <li>
                  <strong>À mon avis,</strong> [position claire, sans réserve].
                </li>
                <li>
                  <strong>En effet,</strong> [argument principal : plan + explication + conséquence + exemple].
                </li>
                <li>
                  <strong>De plus,</strong> [argument de renfort — facultatif].
                </li>
                <li>
                  <strong>Cependant,</strong> [nuance / limite + explication + conséquence + exemple facultatif].
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="card space-y-3 p-5 sm:p-6">
        <h3 className="font-heading text-base font-bold">Checklist Tâche 3</h3>
        <Checklist
          items={[
            'Synthèse des 2 documents sans plagiat',
            'Position personnelle claire dès le 2e paragraphe',
            'Au moins un argument développé (explication + conséquence + exemple)',
            'Une nuance ou une limite',
            'Connecteurs logiques (En effet, De plus, Cependant…)',
            'Total 120–180 mots (équilibre 40–60 + 80–120)',
          ]}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/ee" className="btn-primary">
          Pratiquer la Tâche 3 <ArrowRight size={16} />
        </Link>
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

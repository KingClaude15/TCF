import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import {
  HelpCircle, PenLine, Bell, CheckCircle2, Clock, ArrowRight,
  BookOpen, MessageCircle, GraduationCap, Mic, Headphones,
  ChevronDown, Target, Lightbulb, Languages,
} from 'lucide-react'
import clsx from 'clsx'

const SECTIONS = [
  { id: 'voir-note', label: 'Voir ma note EE', icon: CheckCircle2 },
  { id: 'soumettre', label: 'Soumettre un sujet EE', icon: PenLine },
  { id: 'parcours', label: 'Parcours 41 jours', icon: Target },
  { id: 'modules', label: 'Les 4 épreuves', icon: BookOpen },
  { id: 'anglophones', label: 'Guide anglophones (EE)', icon: Languages },
  { id: 'outils', label: 'Outils d’aide', icon: Lightbulb },
]

function Accordion({ id, title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div id={id} className="card overflow-hidden scroll-mt-24">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
            <Icon size={18} />
          </div>
          <span className="text-sm font-bold text-ink-900 dark:text-white">{title}</span>
        </div>
        <ChevronDown
          size={18}
          className={clsx('text-slate-400 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="space-y-3 border-t border-slate-100 px-5 pb-5 pt-3 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">
          {children}
        </div>
      )}
    </div>
  )
}

function Step({ n, children }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
        {n}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  )
}

export default function Guide() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={HelpCircle}
        eyebrow="Aide"
        title="Comment utiliser la plateforme"
        subtitle="Tout ce qu’il faut savoir pour soumettre, voir tes notes, et progresser — surtout en Expression Écrite."
        accent="brand"
      />

      {/* Quick answer banner — student question */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
          Question fréquente
        </p>
        <p className="mt-1 font-heading text-base font-bold text-ink-900 dark:text-white">
          Après avoir traité un sujet, on fait comment pour voir la note ?
        </p>
        <ol className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <Step n={1}>
            Après la soumission, l’écran affiche <strong>« Correction en cours »</strong>. L’IA évalue tes 3 tâches (souvent moins de 5 minutes).
          </Step>
          <Step n={2}>
            Tu reçois une <strong>notification</strong> (icône cloche en haut à droite). Clique dessus.
          </Step>
          <Step n={3}>
            Ou retourne dans <Link to="/ee" className="font-semibold text-brand-600 underline">Expression Écrite</Link>,
            clique sur le <strong>même numéro de sujet</strong> : tu verras le score /20, le niveau CECR, et le détail tâche par tâche.
          </Step>
        </ol>
      </div>

      {/* Jump links */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            {s.label}
          </a>
        ))}
      </div>

      <div className="space-y-3">
        <Accordion id="voir-note" title="Comment voir ma note après un sujet EE" icon={CheckCircle2} defaultOpen>
          <ol className="space-y-2">
            <Step n={1}>Soumets le sujet (bouton « Soumettre le sujet (3 tâches) »).</Step>
            <Step n={2}>Attends la page « Correction en cours ». Tu peux quitter la page.</Step>
            <Step n={3}>
              Quand c’est prêt : <strong>cloche de notification</strong> en haut → ouvre le lien du sujet.
            </Step>
            <Step n={4}>
              Sinon : menu <strong>Expression Écrite</strong> → clique le numéro du sujet (ex. Sujet 3).
              Le sujet affiche alors les <strong>résultats</strong> : score moyen /20, CECR, grammaire, version corrigée, modèle C2.
            </Step>
          </ol>
          <p className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
            Un sujet terminé a une coche verte sur la liste EE. Les pastilles T1 / T2 / T3 indiquent quelles tâches sont notées.
          </p>
        </Accordion>

        <Accordion id="soumettre" title="Comment soumettre un sujet EE (étape par étape)" icon={PenLine}>
          <ol className="space-y-2">
            <Step n={1}>
              Va dans <Link to="/ee" className="font-semibold text-brand-600 underline">Expression Écrite</Link>.
            </Step>
            <Step n={2}>Clique sur un <strong>numéro de sujet</strong> (le texte de l’exercice s’affiche seulement après le clic).</Step>
            <Step n={3}>
              Rédige Tâche 1, 2 et 3. Tu peux changer d’onglet à tout moment. Sauvegarde auto toutes les 10 secondes.
            </Step>
            <Step n={4}>
              Respecte le nombre de mots indiqué. Le chrono de <strong>60 minutes</strong> démarre dès que tu commences à écrire.
            </Step>
            <Step n={5}>
              Clique <strong>Soumettre le sujet (3 tâches)</strong>. Impossible de coller du texte externe (conditions d’examen).
            </Step>
            <Step n={6}>Attends la correction IA, puis consulte ta note comme indiqué ci-dessus.</Step>
          </ol>
          <p className="text-xs text-slate-500">
            Astuce : lis d’abord la{' '}
            <Link to="/ee/methodologie" className="font-semibold text-brand-600 underline">
              Méthodologie EE
            </Link>{' '}
            avant ton premier sujet noté.
          </p>
        </Accordion>

        <Accordion id="parcours" title="Le défi de 41 jours" icon={Target}>
          <p>
            Le <Link to="/calendar" className="font-semibold text-brand-600 underline">calendrier</Link> structure ta
            préparation jour par jour. Le tableau de bord montre ta progression, ta série (streak) et tes scores moyens.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Fais au moins un module par jour (CO, CE, EE ou EO).</li>
            <li>Consulte le <Link to="/progress-coach" className="font-semibold text-brand-600 underline">Coach IA</Link> pour un plan personnalisé.</li>
            <li>Le <Link to="/learning-center" className="font-semibold text-brand-600 underline">Centre d’apprentissage</Link> reprend tes erreurs récurrentes.</li>
          </ul>
        </Accordion>

        <Accordion id="modules" title="Les 4 épreuves TCF Canada" icon={BookOpen}>
          <ul className="space-y-3">
            <li className="flex gap-2">
              <Headphones size={16} className="mt-0.5 shrink-0 text-brand-500" />
              <span>
                <strong>CO — Compréhension Orale</strong> : séries de questions (audio / scénarios). Note enregistrée par série.
              </span>
            </li>
            <li className="flex gap-2">
              <BookOpen size={16} className="mt-0.5 shrink-0 text-brand-500" />
              <span>
                <strong>CE — Compréhension Écrite</strong> : textes + QCM. Correction automatique.
              </span>
            </li>
            <li className="flex gap-2">
              <PenLine size={16} className="mt-0.5 shrink-0 text-brand-500" />
              <span>
                <strong>EE — Expression Écrite</strong> : 3 tâches, 60 min, correction IA détaillée (score /20 + CECR).
              </span>
            </li>
            <li className="flex gap-2">
              <Mic size={16} className="mt-0.5 shrink-0 text-brand-500" />
              <span>
                <strong>EO — Expression Orale</strong> : sujets oraux avec enregistrement et feedback.
              </span>
            </li>
          </ul>
        </Accordion>

        <Accordion id="anglophones" title="For English speakers struggling with EE" icon={Languages} defaultOpen>
          <p className="font-medium text-ink-900 dark:text-white">
            You’re not alone — EE is the hardest part for many anglophones. Use this simple system:
          </p>
          <ol className="mt-2 space-y-2">
            <Step n={1}>
              <strong>Don’t translate word-for-word from English.</strong> Think in short French chunks: subject + verb + complement.
            </Step>
            <Step n={2}>
              <strong>Learn 3 structures per task</strong> (see Méthodologie EE) and reuse them every time — examiners reward clarity, not rare vocabulary.
            </Step>
            <Step n={3}>
              <strong>Build a personal phrase bank</strong> : connectors (tout d’abord, en outre, cependant, en conclusion), opinion verbs (je pense que, il me semble que), and 10 topic words per common theme (travail, environnement, éducation).
            </Step>
            <Step n={4}>
              After each correction, open the <strong>Erreurs</strong> and <strong>Version corrigée</strong> tabs. Rewrite the same task once without looking — that’s how scores jump from ~10 to 14+.
            </Step>
            <Step n={5}>
              Use <Link to="/ai-chat" className="font-semibold text-brand-600 underline">Chat IA</Link> to ask:
              « Corrige cette phrase » or « Donne 5 façons de dire “I think that” in formal French ».
            </Step>
          </ol>
          <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/40">
            <p className="text-xs font-bold uppercase text-brand-700 dark:text-brand-300">Mini structure EE (all tasks)</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-brand-900 dark:text-brand-100">
              <li><strong>Tâche 1</strong> (message) : Salutation → objet / info → détail → formule de politesse</li>
              <li><strong>Tâche 2</strong> (article / opinion) : Intro + thèse → 2 arguments + exemples → conclusion</li>
              <li><strong>Tâche 3</strong> (essai) : Intro → argument 1 → argument 2 → contre-argument / nuance → conclusion</li>
            </ul>
          </div>
        </Accordion>

        <Accordion id="outils" title="Outils d’aide sur la plateforme" icon={Lightbulb}>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <MessageCircle size={16} className="mt-0.5 text-brand-500" />
              <span>
                <Link to="/ai-chat" className="font-semibold text-brand-600 underline">Chat IA</Link> — questions de grammaire, reformulation, méthodologie.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <GraduationCap size={16} className="mt-0.5 text-brand-500" />
              <span>
                <Link to="/learning-center" className="font-semibold text-brand-600 underline">Centre d’apprentissage</Link> — exercices issus de tes vraies erreurs.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Bell size={16} className="mt-0.5 text-brand-500" />
              <span>
                <strong>Notifications</strong> — résultats EE/EO prêts.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 text-brand-500" />
              <span>
                <Link to="/ee/methodologie" className="font-semibold text-brand-600 underline">Méthodologie EE</Link> — structures, connecteurs, gestion du temps.
              </span>
            </li>
          </ul>
        </Accordion>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/ee" className="btn-primary inline-flex items-center gap-2">
          Aller à l’Expression Écrite <ArrowRight size={16} />
        </Link>
        <Link to="/ee/methodologie" className="btn-outline inline-flex items-center gap-2">
          Méthodologie EE
        </Link>
        <Link to="/ai-chat" className="btn-outline inline-flex items-center gap-2">
          Poser une question au Chat IA
        </Link>
      </div>
    </div>
  )
}

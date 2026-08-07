import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useChallengeData } from '../hooks/useChallengeData'
import {
  topWeakCategories,
  buildFlashcards,
  buildCorrectionDrills,
  buildWeeklyFocus,
  categoryLabel,
} from '../services/learningCenterService'
import { loadItemProgress, setItemProgress } from '../services/learningProgressService'
import { EE_CURRICULUM, getLessonById, curriculumStats } from '../data/eeCurriculum'
import FlashcardDeck from '../components/learning/FlashcardDeck'
import CorrectionDrill from '../components/learning/CorrectionDrill'
import LessonPlayer from '../components/learning/LessonPlayer'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import ProgressBar from '../components/ui/ProgressBar'
import {
  BookOpenCheck,
  Layers,
  PenSquare,
  Compass,
  GraduationCap,
  Library,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import clsx from 'clsx'

const TABS = [
  { key: 'parcours', label: 'Parcours EE', icon: Library },
  { key: 'overview', label: "Tes erreurs", icon: Compass },
  { key: 'vocab', label: 'Fiches perso', icon: Layers },
  { key: 'drills', label: 'Corrections perso', icon: PenSquare },
]

const COLOR = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-100 dark:bg-brand-950 dark:text-brand-300',
  co: 'bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-950 dark:text-sky-300',
  ce: 'bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-950 dark:text-violet-300',
  ee: 'bg-pink-50 text-pink-700 ring-pink-100 dark:bg-pink-950 dark:text-pink-300',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950 dark:text-amber-300',
  gold: 'bg-gold-50 text-gold-800 ring-gold-100 dark:bg-gold-900/40 dark:text-gold-300',
}

export default function LearningCenter() {
  const { user } = useAuth()
  const { loading, eeSubmissions } = useChallengeData()
  const [tab, setTab] = useState('parcours')
  const [flashcardProgress, setFlashcardProgress] = useState({})
  const [lessonProgress, setLessonProgress] = useState({})
  const [progressLoading, setProgressLoading] = useState(true)
  const [activeLessonId, setActiveLessonId] = useState(null)

  useEffect(() => {
    if (!user) return
    setProgressLoading(true)
    Promise.all([
      loadItemProgress(user.id, 'flashcard'),
      loadItemProgress(user.id, 'lesson'),
    ])
      .then(([fc, lessons]) => {
        setFlashcardProgress(fc)
        setLessonProgress(lessons)
      })
      .catch(() => toast.error('Impossible de charger ta progression.'))
      .finally(() => setProgressLoading(false))
  }, [user])

  async function handleMarkCard(cardKey, status) {
    setFlashcardProgress((p) => ({ ...p, [cardKey]: status }))
    try {
      await setItemProgress(user.id, cardKey, status, 'flashcard')
    } catch {
      toast.error("Cette carte n'a pas pu être enregistrée — réessaie.")
    }
  }

  async function handleCompleteLesson(lessonId) {
    setLessonProgress((p) => ({ ...p, [lessonId]: 'completed' }))
    try {
      await setItemProgress(user.id, lessonId, 'completed', 'lesson')
      toast.success('Leçon enregistrée comme terminée')
    } catch {
      toast.error("La progression n'a pas pu être sauvegardée.")
    }
  }

  const stats = useMemo(() => curriculumStats(lessonProgress), [lessonProgress])
  const activeLesson = activeLessonId ? getLessonById(activeLessonId) : null

  const evaluated = eeSubmissions.filter((s) => s.ai_feedback?.[0])
  const weakCategories = topWeakCategories(eeSubmissions, 6)
  const flashcards = buildFlashcards(eeSubmissions)
  const drills = buildCorrectionDrills(eeSubmissions)
  const weeklyFocus = buildWeeklyFocus(eeSubmissions)
  const totalMistakes = weakCategories.reduce((sum, c) => sum + c.count, 0)

  if (loading || progressLoading) {
    return <div className="h-96 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />
  }

  if (activeLesson) {
    return (
      <LessonPlayer
        lesson={activeLesson}
        completed={lessonProgress[activeLesson.id] === 'completed'}
        onBack={() => setActiveLessonId(null)}
        onComplete={handleCompleteLesson}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        eyebrow="Apprentissage EE"
        title="Centre d'apprentissage"
        subtitle="Parcours structuré pour renforcer grammaire, connecteurs, vocabulaire et argumentation — plus un suivi basé sur tes corrections."
        accent="brand"
        image="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=60"
      />

      <div className="card space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Progression du parcours</p>
            <p className="mt-1 font-heading text-2xl font-bold text-ink-900 dark:text-white">
              {stats.completed} / {stats.total} leçons
            </p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            {stats.percent} %
          </span>
        </div>
        <ProgressBar value={stats.percent} color="brand" size="lg" />
      </div>

      {evaluated.length > 0 && (
        <div className="card flex items-start gap-3 border-l-4 border-l-gold-400 p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-50 text-gold-600 dark:bg-gold-900/40 dark:text-gold-300">
            <Compass size={18} />
          </div>
          <div>
            <p className="eyebrow">Focus de la semaine (d’après tes EE)</p>
            <p className="mt-1 text-sm font-medium text-ink-900 dark:text-white">{weeklyFocus}</p>
          </div>
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-slate-100 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              tab === t.key
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'parcours' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Objectif : maîtriser les points qui font gagner des points en Expression Écrite (accords, temps,
            connecteurs, registre formel, argumentation…). Chaque leçon = théorie + exemples + mini-quiz.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {EE_CURRICULUM.map((mod) => {
              const done = mod.lessons.filter((l) => lessonProgress[l.id] === 'completed').length
              return (
                <div key={mod.id} className="card flex flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ring-1', COLOR[mod.color] || COLOR.brand)}>
                      {mod.icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                      {done}/{mod.lessons.length}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-ink-900 dark:text-white">{mod.title}</h3>
                  <p className="mt-1 flex-1 text-xs text-slate-500 dark:text-slate-400">{mod.description}</p>
                  <ul className="mt-4 space-y-2">
                    {mod.lessons.map((lesson) => {
                      const isDone = lessonProgress[lesson.id] === 'completed'
                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            onClick={() => setActiveLessonId(lesson.id)}
                            className="flex w-full items-center gap-2 rounded-xl border border-slate-100 px-3 py-2.5 text-left text-sm transition-colors hover:border-brand-200 hover:bg-brand-50/50 dark:border-slate-800 dark:hover:bg-brand-950/30"
                          >
                            {isDone ? (
                              <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                            ) : (
                              <Clock size={16} className="shrink-0 text-slate-300" />
                            )}
                            <span className="min-w-0 flex-1 font-medium text-ink-900 dark:text-white">{lesson.title}</span>
                            <span className="text-[11px] text-slate-400">~{lesson.minutes} min</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'overview' && (
        <div className="space-y-4">
          {evaluated.length === 0 ? (
            <EmptyState
              icon={BookOpenCheck}
              title="Pas encore de corrections EE"
              description="Soumets des tâches EE pour voir ici la répartition de tes erreurs réelles. En attendant, suis le Parcours EE."
            />
          ) : (
            <>
              <h3 className="text-sm font-semibold">Répartition de tes erreurs ({totalMistakes} au total)</h3>
              {weakCategories.length === 0 ? (
                <p className="text-sm text-slate-400">Aucune erreur catégorisée pour l’instant — bravo !</p>
              ) : (
                <div className="space-y-2">
                  {weakCategories.map((c) => (
                    <div key={c.category} className="card flex items-center justify-between p-3.5">
                      <span className="text-sm font-medium">{categoryLabel(c.category)}</span>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-brand-500"
                            style={{ width: `${Math.min(100, (c.count / totalMistakes) * 100)}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs font-semibold text-slate-500">{c.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'vocab' &&
        (flashcards.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Pas encore de vocabulaire personnalisé"
            description="Les suggestions de tes corrections EE apparaîtront ici. Tu peux déjà travailler le module Vocabulaire du Parcours EE."
          />
        ) : (
          <FlashcardDeck cards={flashcards} progress={flashcardProgress} onMark={handleMarkCard} />
        ))}

      {tab === 'drills' &&
        (drills.length === 0 ? (
          <EmptyState
            icon={PenSquare}
            title="Pas encore d’exercices personnalisés"
            description="Les erreurs de tes copies EE deviendront des drills ici. Utilise le Parcours pour t’entraîner en attendant."
          />
        ) : (
          <CorrectionDrill drills={drills} />
        ))}
    </div>
  )
}

import { useEffect, useState } from 'react'
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
import FlashcardDeck from '../components/learning/FlashcardDeck'
import CorrectionDrill from '../components/learning/CorrectionDrill'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { BookOpenCheck, Layers, PenSquare, Compass, GraduationCap } from 'lucide-react'
import clsx from 'clsx'

const TABS = [
  { key: 'overview', label: "Vue d'ensemble", icon: Compass },
  { key: 'vocab', label: 'Fiches de vocabulaire', icon: Layers },
  { key: 'drills', label: 'Corrections de phrases', icon: PenSquare },
]

export default function LearningCenter() {
  const { user } = useAuth()
  const { loading, eeSubmissions } = useChallengeData()
  const [tab, setTab] = useState('overview')
  const [flashcardProgress, setFlashcardProgress] = useState({})
  const [progressLoading, setProgressLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setProgressLoading(true)
    loadItemProgress(user.id, 'flashcard')
      .then(setFlashcardProgress)
      .catch(() => toast.error("Impossible de charger ta progression des fiches."))
      .finally(() => setProgressLoading(false))
  }, [user])

  async function handleMarkCard(cardKey, status) {
    // Update immediately so the UI never waits on the network...
    setFlashcardProgress((p) => ({ ...p, [cardKey]: status }))
    try {
      await setItemProgress(user.id, cardKey, status, 'flashcard')
    } catch {
      // ...but roll back and tell the student if the save actually failed,
      // so "known" cards silently reverting on next visit is never a surprise.
      toast.error("Cette carte n'a pas pu être enregistrée — réessaie.")
    }
  }

  if (loading) return <div className="h-96 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  const evaluated = eeSubmissions.filter((s) => s.ai_feedback?.[0])
  const weakCategories = topWeakCategories(eeSubmissions, 6)
  const flashcards = buildFlashcards(eeSubmissions)
  const drills = buildCorrectionDrills(eeSubmissions)
  const weeklyFocus = buildWeeklyFocus(eeSubmissions)
  const totalMistakes = weakCategories.reduce((sum, c) => sum + c.count, 0)

  if (evaluated.length === 0) {
    return (
      <EmptyState
        icon={BookOpenCheck}
        title="Rien à analyser pour l'instant"
        description="Soumets et fais évaluer quelques tâches EE — le Centre d'apprentissage générera automatiquement des fiches et exercices à partir de tes propres erreurs."
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        eyebrow="Apprentissage personnalisé"
        title="Centre d'apprentissage"
        subtitle={`Généré à partir de ${evaluated.length} correction${evaluated.length > 1 ? 's' : ''} EE.`}
        accent="brand"
        image="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=60"
      />

      <div className="card flex items-start gap-3 border-l-4 border-l-gold-400 p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-50 text-gold-600 dark:bg-gold-900/40 dark:text-gold-300">
          <Compass size={18} />
        </div>
        <div>
          <p className="eyebrow">Focus de la semaine</p>
          <p className="mt-1 text-sm font-medium text-ink-900 dark:text-white">{weeklyFocus}</p>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-100 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              tab === t.key ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Répartition de tes erreurs ({totalMistakes} au total)</h3>
          {weakCategories.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune erreur catégorisée pour l'instant — bravo !</p>
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
        </div>
      )}

      {tab === 'vocab' && (
        flashcards.length === 0 ? (
          <EmptyState icon={Layers} title="Pas encore de vocabulaire" description="Les suggestions de vocabulaire de tes prochaines corrections EE apparaîtront ici." />
        ) : progressLoading ? (
          <div className="h-64 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />
        ) : (
          <FlashcardDeck cards={flashcards} progress={flashcardProgress} onMark={handleMarkCard} />
        )
      )}

      {tab === 'drills' && (
        drills.length === 0 ? (
          <EmptyState icon={PenSquare} title="Pas encore d'erreurs à corriger" description="Les erreurs relevées dans tes prochaines corrections EE deviendront des exercices ici." />
        ) : (
          <CorrectionDrill drills={drills} />
        )
      )}
    </div>
  )
}

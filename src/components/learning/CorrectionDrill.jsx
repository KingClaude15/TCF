import { useEffect, useState } from 'react'
import { Eye, ChevronRight, RotateCcw, BookOpen, Sparkles } from 'lucide-react'
import { categoryLabel } from '../../services/learningCenterService'
import { expandDrillExplanation } from '../../lib/explanationHelper'

const DRILL_KEY = 'tcf_correction_drill_session'

function loadDrillSession() {
  try {
    const raw = localStorage.getItem(DRILL_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveDrillSession(state) {
  try {
    localStorage.setItem(DRILL_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

export default function CorrectionDrill({ drills }) {
  const saved = loadDrillSession()
  const safeIndex = () => {
    if (!drills?.length) return 0
    const i = typeof saved?.index === 'number' ? saved.index : 0
    return ((i % drills.length) + drills.length) % drills.length
  }

  const [index, setIndex] = useState(safeIndex)
  const [attempt, setAttempt] = useState(() => saved?.attempt || '')
  const [revealed, setRevealed] = useState(() => Boolean(saved?.revealed))
  const [correctCount, setCorrectCount] = useState(() => saved?.correctCount || 0)
  const [answeredCount, setAnsweredCount] = useState(() => saved?.answeredCount || 0)

  const drill = drills[index]
  const detail = drill ? expandDrillExplanation(drill) : null

  useEffect(() => {
    saveDrillSession({ index, attempt, revealed, correctCount, answeredCount })
  }, [index, attempt, revealed, correctCount, answeredCount])

  function reveal() {
    setRevealed(true)
  }

  function markSelf(wasCorrect) {
    setAnsweredCount((n) => n + 1)
    if (wasCorrect) setCorrectCount((n) => n + 1)
    next()
  }

  function next() {
    setAttempt('')
    setRevealed(false)
    setIndex((i) => (i + 1) % drills.length)
  }

  if (!drill) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Phrase {index + 1} / {drills.length}
        </span>
        {answeredCount > 0 && (
          <span>
            Score de session : {correctCount} / {answeredCount}
          </span>
        )}
      </div>

      <div className="card p-5">
        <span className="mb-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          {categoryLabel(drill.category)}
        </span>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Corrige cette phrase tirée de tes propres copies :
        </p>
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {drill.original}
        </p>

        <textarea
          value={attempt}
          onChange={(e) => setAttempt(e.target.value)}
          disabled={revealed}
          rows={2}
          className="input-field mt-3 resize-none disabled:opacity-60"
          placeholder="Écris ta version corrigée ici..."
        />

        {!revealed ? (
          <button onClick={reveal} className="btn-secondary mt-3 w-full">
            <Eye size={15} /> Voir la correction
          </button>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {drill.correction}
            </div>

            <div className="space-y-2 rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-sm dark:border-brand-900 dark:bg-brand-950/30">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                <BookOpen size={14} />
                {detail.title}
              </p>
              <p className="text-slate-800 dark:text-slate-200">
                <strong>En bref : </strong>
                {detail.summary}
              </p>
              {detail.detail && (
                <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                  <strong>Pourquoi en détail : </strong>
                  {detail.detail}
                </p>
              )}
              {detail.tip && (
                <p className="flex items-start gap-2 rounded-lg bg-white/70 px-3 py-2 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                  <Sparkles size={14} className="mt-0.5 shrink-0 text-gold-500" />
                  <span>{detail.tip}</span>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => markSelf(false)} className="btn-secondary flex-1">
                <RotateCcw size={15} /> Je me suis trompé
              </button>
              <button onClick={() => markSelf(true)} className="btn-primary flex-1">
                J&apos;avais juste <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

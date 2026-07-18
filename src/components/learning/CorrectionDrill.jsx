import { useState } from 'react'
import { Eye, ChevronRight, RotateCcw } from 'lucide-react'
import { categoryLabel } from '../../services/learningCenterService'

export default function CorrectionDrill({ drills }) {
  const [index, setIndex] = useState(0)
  const [attempt, setAttempt] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)

  const drill = drills[index]

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
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Corrige cette phrase tirée de tes propres copies :</p>
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{drill.original}</p>

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
            {drill.explanation && <p className="text-xs text-slate-500 dark:text-slate-400">{drill.explanation}</p>}

            <div className="flex gap-3">
              <button onClick={() => markSelf(false)} className="btn-secondary flex-1">
                <RotateCcw size={15} /> Je me suis trompé
              </button>
              <button onClick={() => markSelf(true)} className="btn-primary flex-1">
                J'avais juste <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

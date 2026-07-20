import { useState } from 'react'
import { Loader2, PlusCircle } from 'lucide-react'
import { CO_CE_MAX_POINTS } from '../../lib/tcfScoring'
import clsx from 'clsx'

const DIFFICULTIES = ['easy', 'medium', 'hard']
const DIFFICULTY_CONFIG = {
  easy:   { label: 'Facile',    cls: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900' },
  medium: { label: 'Moyen',     cls: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900' },
  hard:   { label: 'Difficile', cls: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900' },
}

export default function SeriesForm({ maxSeries = 40, existing = [], onSubmit, dayNumber, disabled }) {
  const [seriesNumber, setSeriesNumber] = useState(
    existing.length + 1 <= maxSeries ? existing.length + 1 : 1
  )
  const [score,       setScore]       = useState('')
  const [timeTaken,   setTimeTaken]   = useState('')
  const [difficulty,  setDifficulty]  = useState('medium')
  const [notes,       setNotes]       = useState('')
  const [saving,      setSaving]      = useState(false)

  // For external practice we accept a /699 score directly
  const [scoreMode, setScoreMode] = useState('points') // 'points' | 'raw'
  const [rawCorrect, setRawCorrect] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const finalScore = scoreMode === 'raw'
        ? Math.round((Number(rawCorrect) / 39) * CO_CE_MAX_POINTS)
        : Number(score)

      await onSubmit({
        series_number:      Number(seriesNumber),
        score:              finalScore,
        max_score:          CO_CE_MAX_POINTS,
        time_taken_seconds: timeTaken ? Number(timeTaken) * 60 : null,
        difficulty,
        notes:              notes || null,
        day_number:         dayNumber || null,
      })
      setScore('')
      setRawCorrect('')
      setNotes('')
      setTimeTaken('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-5">
      <div className="flex items-center gap-2">
        <PlusCircle size={16} className="text-brand-500" />
        <h3 className="text-sm font-bold text-ink-900 dark:text-white">Enregistrer un résultat</h3>
      </div>

      {/* Series number */}
      <div>
        <label className="label">N° de série</label>
        <input
          type="number"
          min={1}
          max={maxSeries}
          required
          value={seriesNumber}
          onChange={e => setSeriesNumber(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Score mode toggle */}
      <div>
        <label className="label">Mode de saisie du score</label>
        <div className="flex gap-2">
          {[
            { value: 'points', label: `Score /699` },
            { value: 'raw',    label: 'Bonnes réponses /39' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setScoreMode(opt.value)}
              className={clsx(
                'flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                scoreMode === opt.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Score input */}
      {scoreMode === 'points' ? (
        <div>
          <label className="label">
            Score obtenu
            <span className="ml-1 text-[11px] font-normal text-slate-400">sur {CO_CE_MAX_POINTS} pts</span>
          </label>
          <input
            type="number"
            min={0}
            max={CO_CE_MAX_POINTS}
            required
            value={score}
            onChange={e => setScore(e.target.value)}
            className="input-field"
            placeholder={`ex: 450`}
          />
          {score && (
            <p className="mt-1 text-[11px] text-slate-400">
              ≈ {Math.round((Number(score) / CO_CE_MAX_POINTS) * 100)}% de réussite
            </p>
          )}
        </div>
      ) : (
        <div>
          <label className="label">
            Bonnes réponses
            <span className="ml-1 text-[11px] font-normal text-slate-400">sur 39 questions → converti en /699</span>
          </label>
          <input
            type="number"
            min={0}
            max={39}
            required
            value={rawCorrect}
            onChange={e => setRawCorrect(e.target.value)}
            className="input-field"
            placeholder="ex: 28"
          />
          {rawCorrect && (
            <p className="mt-1 text-[11px] text-brand-600 dark:text-brand-400 font-medium">
              ≈ {Math.round((Number(rawCorrect) / 39) * CO_CE_MAX_POINTS)} pts / {CO_CE_MAX_POINTS}
            </p>
          )}
        </div>
      )}

      {/* Difficulty */}
      <div>
        <label className="label">Difficulté</label>
        <div className="flex gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={clsx(
                'flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors',
                difficulty === d
                  ? DIFFICULTY_CONFIG[d].cls
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300'
              )}
            >
              {DIFFICULTY_CONFIG[d].label}
            </button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div>
        <label className="label">
          Temps passé
          <span className="ml-1 text-[11px] font-normal text-slate-400">(minutes)</span>
        </label>
        <input
          type="number"
          value={timeTaken}
          onChange={e => setTimeTaken(e.target.value)}
          className="input-field"
          placeholder="ex: 35"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes personnelles</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="input-field resize-none"
          placeholder="Difficultés rencontrées, stratégies à retenir..."
        />
      </div>

      <button type="submit" disabled={saving || disabled} className="btn-primary w-full">
        {saving && <Loader2 size={15} className="animate-spin" />}
        Enregistrer le résultat
      </button>
    </form>
  )
}

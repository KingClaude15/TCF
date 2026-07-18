import { useState } from 'react'
import { Loader2 } from 'lucide-react'

const DIFFICULTIES = ['easy', 'medium', 'hard']
const DIFFICULTY_LABELS = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }

export default function SeriesForm({ maxSeries = 40, existing = [], onSubmit, dayNumber }) {
  const [seriesNumber, setSeriesNumber] = useState(existing.length + 1 <= maxSeries ? existing.length + 1 : 1)
  const [score, setScore] = useState('')
  const [maxScore, setMaxScore] = useState(39)
  const [timeTaken, setTimeTaken] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        series_number: Number(seriesNumber),
        score: Number(score),
        max_score: Number(maxScore),
        time_taken_seconds: timeTaken ? Number(timeTaken) * 60 : null,
        difficulty,
        notes: notes || null,
        day_number: dayNumber || null,
      })
      setScore('')
      setNotes('')
      setTimeTaken('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h3 className="text-sm font-semibold">Enregistrer un résultat</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">N° série</label>
          <input
            type="number"
            min={1}
            max={maxSeries}
            required
            value={seriesNumber}
            onChange={(e) => setSeriesNumber(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Difficulté</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field">
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABELS[d]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Score obtenu</label>
          <input
            type="number"
            step="0.5"
            min={0}
            required
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="input-field"
            placeholder="ex: 28"
          />
        </div>
        <div>
          <label className="label">Score max</label>
          <input
            type="number"
            required
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="label">Temps pris (minutes)</label>
        <input type="number" value={timeTaken} onChange={(e) => setTimeTaken(e.target.value)} className="input-field" placeholder="ex: 35" />
      </div>

      <div>
        <label className="label">Notes personnelles</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="input-field resize-none"
          placeholder="Difficultés rencontrées, stratégies à retenir..."
        />
      </div>

      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving && <Loader2 size={16} className="animate-spin" />}
        Enregistrer le résultat
      </button>
    </form>
  )
}

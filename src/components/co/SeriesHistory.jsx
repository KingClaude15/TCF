import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import EmptyState from '../ui/EmptyState'
import { ListChecks } from 'lucide-react'

export default function SeriesHistory({ results, weakAreas, color = '#3182f6' }) {
  if (!results.length) {
    return <EmptyState icon={ListChecks} title="Aucune série enregistrée" description="Ajoute ton premier résultat avec le formulaire." />
  }

  const chartData = results
    .slice()
    .sort((a, b) => a.series_number - b.series_number)
    .map((r) => ({ name: `S${r.series_number}`, score: Number(r.score) }))

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h3 className="mb-3 text-sm font-semibold">Évolution des scores</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {weakAreas?.length > 0 && (
        <div className="card border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Points faibles détectés</p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Séries {weakAreas.map((r) => r.series_number).join(', ')} — révise ces sujets en priorité.
          </p>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Série</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Difficulté</th>
              <th className="px-4 py-3">Temps</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {results
              .slice()
              .sort((a, b) => b.series_number - a.series_number)
              .map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2.5 font-medium">#{r.series_number}</td>
                  <td className="px-4 py-2.5">{r.score} / {r.max_score}</td>
                  <td className="px-4 py-2.5 capitalize">{r.difficulty}</td>
                  <td className="px-4 py-2.5">{r.time_taken_seconds ? `${Math.round(r.time_taken_seconds / 60)} min` : '—'}</td>
                  <td className="max-w-xs truncate px-4 py-2.5 text-slate-500">{r.notes || '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

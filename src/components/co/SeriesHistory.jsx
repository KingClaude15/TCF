import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts'
import EmptyState from '../ui/EmptyState'
import { ListChecks, TrendingUp, AlertTriangle, Clock, Award } from 'lucide-react'
import { coCeScoreToCecr, CO_CE_MAX_POINTS } from '../../lib/tcfScoring'
import { CEFR_BAND_STYLES } from '../../lib/cecrBands'
import clsx from 'clsx'

const DIFF_CONFIG = {
  easy:   { label: 'Facile',    cls: 'badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  medium: { label: 'Moyen',     cls: 'badge bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  hard:   { label: 'Difficile', cls: 'badge bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
}

// CECR band reference lines on the /699 chart
const BAND_LINES = [
  { y: 600, label: 'C2', color: '#10b981' },
  { y: 500, label: 'C1', color: '#14b8a6' },
  { y: 400, label: 'B2', color: '#3b82f6' },
  { y: 300, label: 'B1', color: '#0ea5e9' },
  { y: 200, label: 'A2', color: '#f59e0b' },
  { y: 100, label: 'A1', color: '#f97316' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const pts    = payload[0].value
  const cefr   = coCeScoreToCecr(pts)
  const pct    = Math.round((pts / CO_CE_MAX_POINTS) * 100)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700
                    bg-white dark:bg-slate-900 shadow-lg p-3 text-xs space-y-1">
      <p className="font-bold text-ink-900 dark:text-white">{label}</p>
      <p className="text-slate-500">Score : <span className="font-semibold text-ink-900 dark:text-white">{pts} / {CO_CE_MAX_POINTS}</span></p>
      <p className="text-slate-500">Réussite : <span className="font-semibold">{pct}%</span></p>
      <span className={clsx('badge', CEFR_BAND_STYLES[cefr])}>{cefr}</span>
    </div>
  )
}

export default function SeriesHistory({ results, weakAreas, color = '#3182f6' }) {
  if (!results.length) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Aucune série enregistrée"
        description="Ajoute ton premier résultat avec le formulaire à gauche."
      />
    )
  }

  const sorted = [...results].sort((a, b) => a.series_number - b.series_number)

  // Normalise: older rows may have score on /39 — if max_score !== 699 scale up
  const chartData = sorted.map(r => {
    const raw = Number(r.score)
    const max = Number(r.max_score || CO_CE_MAX_POINTS)
    const pts = max === CO_CE_MAX_POINTS ? raw : Math.round((raw / max) * CO_CE_MAX_POINTS)
    return { name: `S${r.series_number}`, pts, pct: Math.round((pts / CO_CE_MAX_POINTS) * 100) }
  })

  const avgPts   = Math.round(chartData.reduce((s, d) => s + d.pts, 0) / chartData.length)
  const bestPts  = Math.max(...chartData.map(d => d.pts))
  const bestCefr = coCeScoreToCecr(bestPts)
  const avgCefr  = coCeScoreToCecr(avgPts)

  return (
    <div className="space-y-4">

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Award,      label: 'Meilleur score', value: `${bestPts}`, sub: `/ ${CO_CE_MAX_POINTS}`, cefr: bestCefr },
          { icon: TrendingUp, label: 'Score moyen',    value: `${avgPts}`,  sub: `/ ${CO_CE_MAX_POINTS}`, cefr: avgCefr  },
          { icon: ListChecks, label: 'Séries faites',  value: results.length, sub: 'total' },
        ].map(({ icon: Icon, label, value, sub, cefr }) => (
          <div key={label} className="card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Icon size={14} className="text-slate-400" />
              {cefr && <span className={clsx('badge text-[10px]', CEFR_BAND_STYLES[cefr])}>{cefr}</span>}
            </div>
            <p className="font-heading text-xl font-bold text-ink-900 dark:text-white tabular-nums">{value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink-900 dark:text-white">Évolution des scores /699</h3>
          <span className="text-[11px] text-slate-400">Barèmes CECRL affichés</span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis domain={[0, 699]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              {/* CECRL reference lines */}
              {BAND_LINES.map(b => (
                <ReferenceLine key={b.label} y={b.y} stroke={b.color} strokeDasharray="4 3" strokeWidth={1}
                  label={{ value: b.label, position: 'right', fontSize: 10, fill: b.color }} />
              ))}
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="pts"
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weak areas alert */}
      {weakAreas?.length > 0 && (
        <div className="card border-amber-200 dark:border-amber-900
                        bg-amber-50 dark:bg-amber-950/30 p-4 flex gap-3">
          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
              {weakAreas.length} série{weakAreas.length > 1 ? 's' : ''} en-dessous de 60%
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Séries {weakAreas.map(r => r.series_number).join(', ')} — à réviser en priorité.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                {['Série', 'Score /699', 'CECRL', 'Difficulté', 'Temps', 'Notes'].map(h => (
                  <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...results]
                .sort((a, b) => b.series_number - a.series_number)
                .map(r => {
                  const raw  = Number(r.score)
                  const max  = Number(r.max_score || CO_CE_MAX_POINTS)
                  const pts  = max === CO_CE_MAX_POINTS ? raw : Math.round((raw / max) * CO_CE_MAX_POINTS)
                  const pct  = Math.round((pts / CO_CE_MAX_POINTS) * 100)
                  const cefr = r.cecr_level || coCeScoreToCecr(pts)
                  const diff = DIFF_CONFIG[r.difficulty]
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-sm text-ink-900 dark:text-white">
                        #{r.series_number}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold tabular-nums text-ink-900 dark:text-white">{pts}</span>
                          <span className="text-xs text-slate-400">/ {CO_CE_MAX_POINTS}</span>
                          <span className="text-[11px] text-slate-400">({pct}%)</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('badge text-[11px]', CEFR_BAND_STYLES[cefr])}>{cefr}</span>
                      </td>
                      <td className="px-4 py-3">
                        {diff ? <span className={diff.cls}>{diff.label}</span> : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        {r.time_taken_seconds
                          ? <span className="flex items-center gap-1"><Clock size={12} />{Math.round(r.time_taken_seconds / 60)} min</span>
                          : '—'}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-xs text-slate-400">
                        {r.notes || '—'}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

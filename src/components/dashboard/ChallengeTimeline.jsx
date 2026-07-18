import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { ArrowUpRight } from 'lucide-react'

export default function ChallengeTimeline({ progressRows, activeDay }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Parcours du défi — 41 jours</h3>
        <Link to="/calendar" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Vue complète <ArrowUpRight size={13} />
        </Link>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {progressRows.map((day) => {
          const isCurrent = day.day_number === activeDay
          const isDone = day.is_complete
          const isPartial = !isDone && (day.co_done || day.ce_done || day.ee_done)
          return (
            <Link
              key={day.id}
              to="/calendar"
              title={`Jour ${day.day_number}${isDone ? ' — terminé' : isPartial ? ' — en cours' : ''}`}
              className={clsx(
                'flex h-9 w-6 shrink-0 items-end justify-center rounded-full transition-transform hover:-translate-y-0.5',
                isCurrent && 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-surface-darkCard'
              )}
            >
              <span
                className={clsx(
                  'w-full rounded-full transition-all',
                  isDone
                    ? 'h-9 bg-gradient-to-t from-brand-600 to-brand-400'
                    : isPartial
                    ? 'h-6 bg-amber-300 dark:bg-amber-600'
                    : isCurrent
                    ? 'h-4 bg-brand-200 dark:bg-brand-800'
                    : 'h-2.5 bg-slate-200 dark:bg-slate-800'
                )}
              />
            </Link>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-500" /> Terminé</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> En cours</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" /> À venir</span>
      </div>
    </div>
  )
}

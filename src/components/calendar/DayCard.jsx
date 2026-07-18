import clsx from 'clsx'
import { CheckCircle2, Circle, Lock } from 'lucide-react'

export default function DayCard({ day, coScore, ceScore, eeScore, onClick, isLocked, isToday }) {
  const { day_number, co_done, ce_done, ee_done, is_complete } = day

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={clsx(
        'card card-hover relative flex flex-col gap-2 p-4 text-left transition-all',
        is_complete && 'ring-1 ring-emerald-200 dark:ring-emerald-900',
        isToday && !is_complete && 'ring-2 ring-brand-400 dark:ring-brand-500',
        isLocked && 'cursor-not-allowed opacity-50'
      )}
    >
      {isToday && (
        <span className="absolute -top-2 left-3 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          Aujourd'hui
        </span>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">Jour {day_number}</span>
        {isLocked ? (
          <Lock size={16} className="text-slate-300" />
        ) : is_complete ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <Circle size={18} className="text-slate-300" />
        )}
      </div>

      <div className="space-y-1.5 text-xs">
        <Row label="CO" done={co_done} score={coScore} color="text-co-DEFAULT" />
        <Row label="CE" done={ce_done} score={ceScore} color="text-ce-DEFAULT" />
        <Row label="EE" done={ee_done} score={eeScore} color="text-ee-DEFAULT" />
      </div>
    </button>
  )
}

function Row({ label, done, score, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className={clsx('font-medium', color)}>{label}</span>
      <span className={clsx(done ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600')}>
        {done ? (score ?? '✓') : '—'}
      </span>
    </div>
  )
}

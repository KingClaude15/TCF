import clsx from 'clsx'

const COLOR_MAP = {
  brand: 'bg-brand-500',
  co: 'bg-co-DEFAULT',
  ce: 'bg-ce-DEFAULT',
  ee: 'bg-ee-DEFAULT',
  emerald: 'bg-emerald-500',
}

export default function ProgressBar({ value = 0, color = 'brand', size = 'md', showLabel = false, className }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={clsx('w-full', className)}>
      <div
        className={clsx(
          'w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
          size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'
        )}
      >
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out', COLOR_MAP[color])}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && <p className="mt-1 text-xs font-medium text-slate-500">{pct}%</p>}
    </div>
  )
}

import clsx from 'clsx'

const ACCENTS = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 ring-brand-100 dark:ring-brand-900',
  co: 'bg-co-light text-co-dark dark:bg-sky-950 dark:text-sky-300 ring-sky-100 dark:ring-sky-900',
  ce: 'bg-ce-light text-ce-dark dark:bg-violet-950 dark:text-violet-300 ring-violet-100 dark:ring-violet-900',
  ee: 'bg-ee-light text-ee-dark dark:bg-pink-950 dark:text-pink-300 ring-pink-100 dark:ring-pink-900',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300 ring-amber-100 dark:ring-amber-900',
  gold: 'bg-gold-50 text-gold-700 dark:bg-gold-900/40 dark:text-gold-300 ring-gold-100 dark:ring-gold-900',
}

export default function StatCard({ icon: Icon, label, value, sublabel, accent = 'brand' }) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
          <p className="mt-1.5 font-heading text-2xl font-bold tracking-tight text-ink-900 dark:text-white">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-slate-400">{sublabel}</p>}
        </div>
        {Icon && (
          <div className={clsx('flex h-11 w-11 items-center justify-center rounded-xl ring-1', ACCENTS[accent])}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  )
}

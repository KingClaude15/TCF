export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-400 ring-1 ring-slate-100 dark:from-slate-800 dark:to-slate-800/60 dark:text-slate-500 dark:ring-slate-700">
          <Icon size={28} />
        </div>
      )}
      <h3 className="font-heading text-base font-bold text-ink-900 dark:text-white">{title}</h3>
      {description && <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action}
    </div>
  )
}

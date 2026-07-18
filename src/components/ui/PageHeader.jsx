import clsx from 'clsx'

const ACCENTS = {
  brand: 'from-brand-600 via-brand-700 to-ink-900',
  co: 'from-sky-600 via-sky-800 to-ink-900',
  ce: 'from-violet-600 via-violet-800 to-ink-900',
  ee: 'from-pink-600 via-pink-800 to-ink-900',
  gold: 'from-gold-500 via-ink-800 to-ink-900',
}

export default function PageHeader({ icon: Icon, eyebrow, title, subtitle, accent = 'brand', right, image }) {
  return (
    <div className={clsx('page-hero bg-gradient-to-br p-6 sm:p-8', ACCENTS[accent])}>
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-ink-900/60 via-ink-900/10 to-transparent" />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur sm:flex">
              <Icon size={22} />
            </div>
          )}
          <div>
            {eyebrow && <p className="eyebrow !text-white/70">{eyebrow}</p>}
            <h2 className="mt-1 font-heading text-xl font-bold sm:text-2xl">{title}</h2>
            {subtitle && <p className="mt-1.5 max-w-xl text-sm text-white/70">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </div>
  )
}

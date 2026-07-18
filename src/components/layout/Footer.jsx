import { GraduationCap, Mail, ShieldCheck, Headphones, BookOpen, PenLine, ExternalLink } from 'lucide-react'

const YEAR = new Date().getFullYear()

const PROGRAM_LINKS = [
  { label: 'Compréhension Orale', to: '/co', icon: Headphones },
  { label: 'Compréhension Écrite', to: '/ce', icon: BookOpen },
  { label: 'Expression Écrite', to: '/ee', icon: PenLine },
]

const RESOURCE_LINKS = [
  { label: "Centre d'apprentissage", to: '/learning-center' },
  { label: 'Coach IA', to: '/progress-coach' },
  { label: 'Statistiques', to: '/statistics' },
  { label: 'Calendrier du défi', to: '/calendar' },
]

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-darkCard">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
                <GraduationCap size={18} />
              </div>
              <p className="font-heading text-sm font-bold text-ink-900 dark:text-white">TCF Challenge</p>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Un parcours structuré de 41 jours conçu pour préparer les candidats francophones au TCF Canada,
              module par module.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
              <ShieldCheck size={14} className="text-emerald-500" />
              Contenu aligné sur le format officiel TCF Canada
            </div>
          </div>

          <div>
            <p className="eyebrow text-slate-400 dark:text-slate-500">Modules</p>
            <ul className="mt-3 space-y-2.5">
              {PROGRAM_LINKS.map(({ label, to, icon: Icon }) => (
                <li key={to}>
                  <a href={to} className="flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-300">
                    <Icon size={14} className="text-slate-400" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-slate-400 dark:text-slate-500">Ressources</p>
            <ul className="mt-3 space-y-2.5">
              {RESOURCE_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <a href={to} className="text-sm text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-300">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-slate-400 dark:text-slate-500">Assistance</p>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                support@tcfchallenge.ca
              </li>
              <li>
                <a
                  href="https://www.france-education-international.fr/tcf"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                >
                  Format officiel TCF Canada <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 dark:border-slate-800 sm:flex-row">
          <p>© {YEAR} TCF 41-Day Challenge. Tous droits réservés.</p>
          <p className="flex items-center gap-1.5">
            Conçu pour votre réussite <span aria-hidden="true">🇨🇦</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

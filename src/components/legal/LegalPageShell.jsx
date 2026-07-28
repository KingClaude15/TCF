import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PublicNav from '../layout/PublicNav'
import Footer from '../layout/Footer'

export default function LegalPageShell({ eyebrow, title, updatedAt, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface dark:bg-surface-dark">
      <PublicNav />

      <main className="flex-1 animate-fadeIn px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300">
            <ArrowLeft size={15} /> Retour à l'accueil
          </Link>

          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-1.5 font-heading text-3xl font-bold text-ink-900 dark:text-white">{title}</h1>
          {updatedAt && <p className="mt-1.5 text-sm text-slate-400">Dernière mise à jour : {updatedAt}</p>}

          <div className="mt-8 max-w-none space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink-900 [&_h2]:dark:text-white [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

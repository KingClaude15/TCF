import { Link, Navigate } from 'react-router-dom'
import {
  GraduationCap, Headphones, BookOpen, PenLine, Mic, Brain, CalendarDays,
  Award, ArrowRight, ShieldCheck, Sparkles, TrendingUp, CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PublicNav from '../components/layout/PublicNav'
import Footer from '../components/layout/Footer'

const MODULES = [
  { icon: Headphones, label: 'CO' },
  { icon: BookOpen, label: 'CE' },
  { icon: PenLine, label: 'EE' },
  { icon: Mic, label: 'EO' },
]

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Un parcours structuré de 41 jours',
    description: "Progresse jour après jour à travers les quatre compétences de l'examen, sans devoir deviner par où commencer.",
  },
  {
    icon: Sparkles,
    title: 'Correction IA détaillée',
    description: 'Score estimé, niveau CECRL, grammaire, vocabulaire, structure — pour chaque rédaction et chaque enregistrement oral.',
  },
  {
    icon: Brain,
    title: 'Coach de progression IA',
    description: 'Détection de tes tendances sur plusieurs semaines et prédiction de ta préparation avant le jour J.',
  },
  {
    icon: GraduationCap,
    title: "Centre d'apprentissage",
    description: 'Fiches de vocabulaire personnalisées et exercices ciblés générés à partir de tes propres erreurs.',
  },
  {
    icon: TrendingUp,
    title: 'Statistiques complètes',
    description: 'Suis ta progression CO/CE/EE/EO au fil du temps, avec des graphiques clairs par compétence.',
  },
  {
    icon: Award,
    title: 'Séries et succès',
    description: 'Reste motivé avec un suivi de série de jours consécutifs et des badges de progression.',
  },
]

export default function Landing() {
  const { isAuthenticated, loading } = useAuth()

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface dark:bg-surface-dark">
      <PublicNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 pb-16 pt-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="page-hero px-6 py-14 text-center sm:px-12 sm:py-20">
              <div className="relative">
                <span className="badge mx-auto bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  100% gratuit, pour toujours
                </span>

                <h1 className="mx-auto mt-5 max-w-3xl font-heading text-3xl font-bold leading-tight text-white sm:text-5xl">
                  Prépare ton TCF Canada avec méthode, en 41 jours.
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                  Séries CO/CE, rédactions EE et enregistrements EO corrigés par IA selon le barème officiel CECRL, un
                  coach de progression, et un vrai suivi de préparation — sans jamais payer un centime.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link to="/signup" className="btn-gold w-full sm:w-auto">
                    Commencer le défi gratuitement <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="btn-secondary w-full !bg-white/10 !text-white ring-1 ring-white/20 hover:!bg-white/20 sm:w-auto">
                    J'ai déjà un compte
                  </Link>
                </div>

                <div className="mx-auto mt-10 grid max-w-md grid-cols-4 gap-3">
                  {MODULES.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 text-white backdrop-blur">
                      <Icon size={18} />
                      <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-xl text-center">
              <p className="eyebrow justify-center">Tout ce qu'il te faut</p>
              <h2 className="mt-1.5 font-heading text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">
                Un vrai programme de préparation, pas juste des exercices
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="card card-hover p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 font-heading text-base font-bold text-ink-900 dark:text-white">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why free */}
        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="card p-8 sm:p-10">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-ink-900 dark:text-white">
                    Pourquoi c'est gratuit — et le restera
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Se préparer sérieusement au TCF coûte souvent cher. Cette plateforme existe pour retirer cette
                    barrière : pas d'abonnement, pas de version "premium", pas de publicité. Juste un parcours
                    complet, accessible à tous les candidats.
                  </p>
                  <Link to="/about" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">
                    En savoir plus sur notre mission <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">
              Prêt à commencer ton défi de 41 jours ?
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Crée ton compte en moins d'une minute — aucune carte bancaire requise, jamais.
            </p>
            <Link to="/signup" className="btn-primary mt-6 inline-flex">
              <CheckCircle2 size={16} /> Créer mon compte gratuit
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

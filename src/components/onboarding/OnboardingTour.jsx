import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays, GraduationCap, Brain, PenLine, X, ArrowRight, ArrowLeft, PartyPopper,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../services/profileService'

const STEPS = [
  {
    icon: PartyPopper,
    title: 'Bienvenue dans ton défi de 41 jours !',
    body: "Un parcours structuré pour préparer ton TCF Canada, module par module, à ton rythme. Voici un tour rapide des quatre endroits les plus utiles.",
    accent: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300',
  },
  {
    icon: CalendarDays,
    title: 'Le calendrier du défi',
    body: "Chaque jour se marque automatiquement dès que tu termines tes séries CO, CE, EE et EO. Tu peux avancer à ton propre rythme — les 41 jours t'attendent.",
    accent: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300',
  },
  {
    icon: PenLine,
    title: "L'Expression Écrite, en profondeur",
    body: "C'est souvent la partie la plus difficile. Chaque rédaction reçoit une correction détaillée : score, niveau CECRL, grammaire, vocabulaire, une version corrigée et un modèle de niveau C2.",
    accent: 'bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-300',
  },
  {
    icon: GraduationCap,
    title: "Le centre d'apprentissage",
    body: 'Des fiches de vocabulaire générées à partir de tes propres corrections, pour retravailler exactement ce qui te manque.',
    accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300',
  },
  {
    icon: Brain,
    title: 'Ton coach de progression IA',
    body: "Il détecte tes tendances sur plusieurs semaines et te dit, honnêtement, si tu es prêt(e) pour le jour J — ou ce qu'il te reste à travailler.",
    accent: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300',
  },
]

export default function OnboardingTour({ onDone }) {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [closing, setClosing] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  async function finish(navigateTo) {
    if (closing) return
    setClosing(true)
    try {
      await updateProfile(user.id, { onboarding_completed: true })
      await refreshProfile()
    } catch {
      // Non-critical — worst case the tour shows again next time, which is
      // harmless. Never block the user from continuing over this.
    }
    onDone?.()
    if (navigateTo) navigate(navigateTo)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-surface-darkCard">
        <div className="flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${current.accent}`}>
            <current.icon size={22} />
          </div>
          <button
            onClick={() => finish()}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Fermer la visite guidée"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="mt-4 font-heading text-lg font-bold text-ink-900 dark:text-white">{current.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{current.body}</p>

        <div className="mt-6 flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-brand-500' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} className="btn-secondary !px-3.5">
              <ArrowLeft size={15} /> Précédent
            </button>
          ) : (
            <button onClick={() => finish()} className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              Passer
            </button>
          )}

          {isLast ? (
            <button onClick={() => finish('/ee')} disabled={closing} className="btn-primary">
              Commencer <ArrowRight size={15} />
            </button>
          ) : (
            <button onClick={() => setStep((s) => s + 1)} className="btn-primary">
              Suivant <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

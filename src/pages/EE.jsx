import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listPublishedSujets, encodeTopicNumber } from '../services/sujetsService'
import { supabase } from '../lib/supabaseClient'
import StatCard from '../components/ui/StatCard'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { PenLine, Target, CheckCircle2, Circle, Clock } from 'lucide-react'

export default function EE() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sujets, setSujets] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      listPublishedSujets(),
      supabase.from('ee_submissions').select('*, ai_feedback(estimated_score)').eq('user_id', user.id),
    ])
      .then(([sujetsData, { data: subsData, error }]) => {
        if (error) throw error
        setSujets(sujetsData)
        setSubmissions(subsData || [])
      })
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="h-64 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  const byTopicNumber = new Map(submissions.map((s) => [s.topic_number, s]))
  const scores = submissions.map((s) => s.ai_feedback?.[0]?.estimated_score).filter((v) => typeof v === 'number')
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null
  const completedSujets = sujets.filter((sujet) =>
    [1, 2, 3].every((t) => byTopicNumber.get(encodeTopicNumber(sujet.sujet_number, t))?.status === 'evaluated')
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PenLine}
        eyebrow="Épreuve 3"
        title="Expression Écrite"
        subtitle="Chaque sujet contient les Tâches 1, 2 et 3 — comme à l'examen réel — avec correction IA détaillée."
        accent="ee"
        image="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={PenLine} label="Sujets terminés" value={`${completedSujets} / ${sujets.length}`} accent="ee" />
        <StatCard icon={Target} label="Score EE moyen" value={avgScore ?? '—'} sublabel="sur 20" accent="ee" />
        <StatCard icon={Clock} label="Durée par sujet" value="60 min" sublabel="3 tâches, un seul chrono" accent="brand" />
      </div>

      {sujets.length === 0 ? (
        <EmptyState icon={PenLine} title="Aucun sujet disponible" description="Un administrateur doit d'abord ajouter des sujets EE." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sujets.map((sujet) => {
            const taskStates = [1, 2, 3].map((t) => byTopicNumber.get(encodeTopicNumber(sujet.sujet_number, t)));
            const doneCount = taskStates.filter((s) => s?.status === 'evaluated').length
            const started = taskStates.some((s) => s)

            return (
              <button
                key={sujet.id}
                onClick={() => navigate(`/ee/${sujet.sujet_number}`)}
                className="card card-hover flex flex-col gap-3 p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Sujet {sujet.sujet_number}</span>
                  {doneCount === 3 ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <Circle size={18} className="text-slate-300" />
                  )}
                </div>
                <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{sujet.tache1_prompt}</p>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  {[1, 2, 3].map((t) => (
                    <span
                      key={t}
                      className={`rounded-full px-2 py-0.5 ${
                        taskStates[t - 1]?.status === 'evaluated'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                      }`}
                    >
                      T{t}
                    </span>
                  ))}
                  {started && doneCount < 3 && <span className="ml-auto text-amber-500">En cours</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

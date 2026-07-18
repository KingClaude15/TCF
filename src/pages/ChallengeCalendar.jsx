import { useNavigate } from 'react-router-dom'
import { useChallengeData } from '../hooks/useChallengeData'
import DayCard from '../components/calendar/DayCard'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import { useState } from 'react'
import { Headphones, BookOpen, PenLine, CalendarDays } from 'lucide-react'

export default function ChallengeCalendar() {
  const { loading, progressRows, coResults, ceResults, eeSubmissions, activeDay } = useChallengeData()
  const [selectedDay, setSelectedDay] = useState(null)
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {[...Array(18)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    )
  }

  const byDay = (dayNumber) => ({
    co: coResults.find((r) => r.day_number === dayNumber),
    ce: ceResults.find((r) => r.day_number === dayNumber),
    ee: eeSubmissions.find((s) => s.day_number === dayNumber),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarDays}
        eyebrow="Feuille de route"
        title="Calendrier du défi"
        subtitle="Tous tes 41 jours en un coup d'œil — clique sur un jour pour voir le détail de chaque module."
        accent="gold"
        image="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1400&q=80"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {progressRows.map((day) => {
          const linked = byDay(day.day_number)
          return (
            <DayCard
              key={day.id}
              day={day}
              coScore={linked.co?.score}
              ceScore={linked.ce?.score}
              eeScore={linked.ee?.ai_feedback?.[0]?.estimated_score}
              isToday={day.day_number === activeDay}
              onClick={() => setSelectedDay({ ...day, linked })}
            />
          )
        })}
      </div>

      <Modal open={!!selectedDay} onClose={() => setSelectedDay(null)} title={`Jour ${selectedDay?.day_number || ''}`}>
        {selectedDay && (
          <div className="space-y-3">
            <ModuleRow
              icon={Headphones}
              label="Compréhension Orale"
              done={selectedDay.co_done}
              detail={selectedDay.linked.co ? `Série ${selectedDay.linked.co.series_number} — ${selectedDay.linked.co.score}/${selectedDay.linked.co.max_score}` : 'Pas encore fait'}
              onClick={() => navigate('/co')}
            />
            <ModuleRow
              icon={BookOpen}
              label="Compréhension Écrite"
              done={selectedDay.ce_done}
              detail={selectedDay.linked.ce ? `Série ${selectedDay.linked.ce.series_number} — ${selectedDay.linked.ce.score}/${selectedDay.linked.ce.max_score}` : 'Pas encore fait'}
              onClick={() => navigate('/ce')}
            />
            <ModuleRow
              icon={PenLine}
              label="Expression Écrite"
              done={selectedDay.ee_done}
              detail={selectedDay.linked.ee ? `Sujet ${selectedDay.linked.ee.topic_number} — ${selectedDay.linked.ee.status}` : 'Pas encore fait'}
              onClick={() => navigate('/ee')}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

function ModuleRow({ icon: Icon, label, done, detail, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-3.5 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
    >
      <span className="flex items-center gap-3">
        <Icon size={18} className="text-brand-500" />
        <span>
          <span className="block text-sm font-medium">{label}</span>
          <span className="block text-xs text-slate-400">{detail}</span>
        </span>
      </span>
      <span className={`text-xs font-semibold ${done ? 'text-emerald-500' : 'text-slate-300'}`}>{done ? '✓ Fait' : 'À faire'}</span>
    </button>
  )
}

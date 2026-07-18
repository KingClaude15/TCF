import { useChallengeData } from '../hooks/useChallengeData'
import {
  LineChart, Line, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
  RadialBarChart, RadialBar,
} from 'recharts'
import StatCard from '../components/ui/StatCard'
import PageHeader from '../components/ui/PageHeader'
import { TrendingUp, Percent, Flame, BarChart3 } from 'lucide-react'

export default function Statistics() {
  const { loading, coResults, ceResults, eeSubmissions, progressRows, coAverage, ceAverage, eeAverage, completionPct, profile } =
    useChallengeData()

  if (loading) return <div className="h-96 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  const coProgression = coResults
    .slice().sort((a, b) => a.series_number - b.series_number)
    .map((r) => ({ name: `S${r.series_number}`, CO: Number(r.score) }))

  const ceProgression = ceResults
    .slice().sort((a, b) => a.series_number - b.series_number)
    .map((r) => ({ name: `S${r.series_number}`, CE: Number(r.score) }))

  const eeProgression = eeSubmissions
    .filter((s) => s.ai_feedback?.[0]?.estimated_score != null)
    .slice().sort((a, b) => a.topic_number - b.topic_number)
    .map((s) => ({ name: `T${s.topic_number}`, EE: s.ai_feedback[0].estimated_score }))

  const weeklyCompletion = buildWeeklyCompletion(progressRows)

  const radialData = [
    { name: 'CO', value: coAverage ? Math.round((coAverage / 39) * 100) : 0, fill: '#0ea5e9' },
    { name: 'CE', value: ceAverage ? Math.round((ceAverage / 39) * 100) : 0, fill: '#8b5cf6' },
    { name: 'EE', value: eeAverage ? Math.round((eeAverage / 20) * 100) : 0, fill: '#ec4899' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        eyebrow="Analyse de performance"
        title="Statistiques"
        subtitle="Analyse détaillée de ta progression sur les trois épreuves du TCF Canada."
        accent="gold"
        image="https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1400&q=80"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Percent} label="Taux de complétion" value={`${completionPct}%`} accent="brand" />
        <StatCard icon={Flame} label="Meilleure série" value={`${profile?.longest_streak ?? 0} jours`} accent="amber" />
        <StatCard icon={TrendingUp} label="Score EE moyen" value={eeAverage ?? '—'} sublabel="sur 20" accent="ee" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard title="Progression CO">
          <LineChart data={coProgression}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="CO" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 2 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Progression CE">
          <LineChart data={ceProgression}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="CE" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 2 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Progression EE">
          <LineChart data={eeProgression}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="EE" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 2 }} />
          </LineChart>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Complétion hebdomadaire">
          <BarChart data={weeklyCompletion}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="days" fill="#3182f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Moyennes par module (%)">
          <RadialBarChart innerRadius="20%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
            <RadialBar background dataKey="value" cornerRadius={8} />
            <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          </RadialBarChart>
        </ChartCard>
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="card p-5">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function buildWeeklyCompletion(progressRows) {
  const weeks = []
  for (let w = 0; w < 6; w++) {
    const start = w * 7 + 1
    const end = Math.min(start + 6, 41)
    const slice = progressRows.filter((r) => r.day_number >= start && r.day_number <= end)
    weeks.push({ week: `S${w + 1}`, days: slice.filter((r) => r.is_complete).length })
  }
  return weeks
}

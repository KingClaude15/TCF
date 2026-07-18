import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'

/**
 * `points`: array of numbers (e.g. recent scores as %). Renders nothing if
 * there isn't enough real data to draw a meaningful trend line — no
 * fabricated placeholder shape.
 */
export default function Sparkline({ points, color = '#3182f6', height = 32 }) {
  if (!points || points.length < 2) return null
  const data = points.map((v, i) => ({ i, v }))

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
          <defs>
            <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.75} fill={`url(#spark-${color.replace('#', '')})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

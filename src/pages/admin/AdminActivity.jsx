import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, Search, Headphones, BookOpen, PenLine, RefreshCcw } from 'lucide-react'
import clsx from 'clsx'
import { listAllActivity } from '../../services/adminActivityService'
import EmptyState from '../../components/ui/EmptyState'

const MODULE_STYLES = {
  CO: { icon: Headphones, className: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  CE: { icon: BookOpen, className: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
  EE: { icon: PenLine, className: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' },
}

const PAGE_SIZE = 25

export default function AdminActivity() {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [page, setPage] = useState(1)

  async function load() {
    setLoading(true)
    try {
      setActivity(await listAllActivity())
    } catch (err) {
      toast.error(err.message || "Impossible de charger l'activité")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return activity.filter((a) => {
      if (moduleFilter !== 'all' && a.module !== moduleFilter) return false
      if (!q) return true
      const name = (a.user?.full_name || '').toLowerCase()
      const email = (a.user?.email || '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [activity, query, moduleFilter])

  const paged = filtered.slice(0, page * PAGE_SIZE)

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="input-field w-64 pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs font-semibold dark:bg-slate-800">
            {['all', 'CO', 'CE', 'EE'].map((m) => (
              <button
                key={m}
                onClick={() => setModuleFilter(m)}
                className={clsx(
                  'rounded-md px-3 py-1.5 transition-colors',
                  moduleFilter === m ? 'bg-white shadow-sm dark:bg-slate-700' : 'text-slate-500'
                )}
              >
                {m === 'all' ? 'Tout' : m}
              </button>
            ))}
          </div>
          <button onClick={load} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="Rafraîchir">
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="Aucune activité trouvée" description="Aucun exercice ne correspond à ces filtres." />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-800">
                  <th className="px-4 py-3 font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 font-semibold">Module</th>
                  <th className="px-4 py-3 font-semibold">Exercice</th>
                  <th className="px-4 py-3 font-semibold">Jour</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((a) => {
                  const { icon: Icon, className } = MODULE_STYLES[a.module]
                  return (
                    <tr key={a.id} className="border-b border-slate-50 last:border-0 dark:border-slate-800/60">
                      <td className="px-4 py-3">
                        <p className="font-medium">{a.user?.full_name || '—'}</p>
                        <p className="text-xs text-slate-400">{a.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', className)}>
                          <Icon size={12} /> {a.module}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.label}</td>
                      <td className="px-4 py-3 text-slate-500">{a.dayNumber ?? '—'}</td>
                      <td className="px-4 py-3 font-semibold">{a.scoreLabel}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {new Date(a.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {paged.length < filtered.length && (
            <button onClick={() => setPage((p) => p + 1)} className="btn-secondary mx-auto flex items-center gap-2">
              Voir plus ({filtered.length - paged.length} restants)
            </button>
          )}
        </>
      )}
    </div>
  )
}

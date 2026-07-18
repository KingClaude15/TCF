import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Footer from './Footer'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Challenge Calendar',
  '/co': 'Compréhension Orale',
  '/ce': 'Compréhension Écrite',
  '/ee': 'Expression Écrite',
  '/learning-center': "Centre d'apprentissage",
  '/progress-coach': 'Coach IA',
  '/statistics': 'Statistics',
  '/recommendations': 'Recommendations',
  '/profile': 'Profile',
}

// The footer never appears on EE (it's a timed writing exam from list to workspace)
// or on any quiz page where the candidate is actively answering questions —
// those views need the full viewport with no distracting chrome below the fold.
const NO_FOOTER_PATTERNS = [/^\/ee(\/|$)/, /^\/co\/[^/]+$/, /^\/ce\/[^/]+$/]

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const title = TITLES[pathname] || (pathname.startsWith('/ee/') ? 'Expression Écrite' : 'TCF Challenge')
  const showFooter = !NO_FOOTER_PATTERNS.some((re) => re.test(pathname))

  return (
    <div className="flex min-h-screen bg-surface dark:bg-surface-dark">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        {showFooter && (
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <Footer />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

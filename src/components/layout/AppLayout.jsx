import { useState, useEffect, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Footer from './Footer'
import OnboardingTour from '../onboarding/OnboardingTour'
import AiChatWidget from '../chat/AiChatWidget'
import WhatsAppButton from '../chat/WhatsAppButton'
import { useAuth } from '../../context/AuthContext'

const TITLES = {
  '/dashboard':       'Dashboard',
  '/calendar':        'Challenge Calendar',
  '/co':              'Compréhension Orale',
  '/ce':              'Compréhension Écrite',
  '/ee':              'Expression Écrite',
  '/ee/methodologie': 'Méthodologie EE',
  '/learning-center': "Centre d'apprentissage",
  '/progress-coach':  'Coach IA',
  '/ai-chat':         'Chat IA',
  '/guide':          'Guide d\'utilisation',
  '/pricing':        'Tarifs / Premium',
  '/statistics':      'Statistics',
  '/recommendations': 'Recommendations',
  '/profile':         'Profile',
}

const NO_FOOTER_PATTERNS = [/^\/ee(\/|$)/, /^\/co\/[^/]+$/, /^\/ce\/[^/]+$/]

// Used ONLY inside the Outlet's own Suspense boundary below — never at the
// App.jsx root. Keeping the fallback scoped here means a lazy page chunk
// still loading shows this small spinner in the content area while the
// Sidebar/Topbar/Footer stay mounted, instead of the whole shell
// unmounting and reappearing (which is what made navigation look like a
// full page refresh).
function ContentLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
    </div>
  )
}

// localStorage key — user-scoped so multiple accounts on the same browser
// each get their own dismiss state.
function tourDismissKey(userId) {
  return `tcf_tour_dismissed_${userId}`
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const { pathname }                    = useLocation()
  const { profile, profileLoading, user } = useAuth()

  // ── Onboarding tour visibility ────────────────────────────────────────────
  // Three-layer guard so the tour NEVER blocks an existing user:
  //
  //  1. DB layer  — profile.onboarding_completed comes from the `profiles`
  //     table. AuthContext now selects this column (it was previously omitted,
  //     which caused `undefined` → falsy → tour always showed).
  //
  //  2. localStorage layer — a user-scoped flag written the moment the user
  //     clicks X or Passer. This makes the dismiss instant (no round-trip
  //     to Supabase needed before re-render) AND survives a page refresh
  //     even if the DB write fails for any reason.
  //
  //  3. React state layer — `tourDismissed` prevents a flicker if the
  //     profile re-fetches mid-session.
  //
  // The tour is shown ONLY when ALL of these are false/absent:
  //   - profile.onboarding_completed  (DB truth)
  //   - localStorage flag             (instant dismiss, survives refresh)
  //   - tourDismissed state           (prevents re-render flicker)

  const [tourDismissed, setTourDismissed] = useState(() => {
    // Initialise from localStorage synchronously so there is never a single
    // render where the tour flashes before the localStorage check runs.
    if (!user?.id) return false
    return localStorage.getItem(tourDismissKey(user.id)) === 'true'
  })

  // If the user id changes (unlikely mid-session, but covers logout+login
  // in the same tab), re-check localStorage for the new user.
  useEffect(() => {
    if (!user?.id) return
    const dismissed = localStorage.getItem(tourDismissKey(user.id)) === 'true'
    setTourDismissed(dismissed)
  }, [user?.id])

  function handleTourDone() {
    // Write to localStorage immediately so the modal disappears on this
    // render even if the DB write in OnboardingTour is still in flight.
    if (user?.id) {
      localStorage.setItem(tourDismissKey(user.id), 'true')
    }
    setTourDismissed(true)
  }

  const showTour =
    !profileLoading &&          // profile has loaded
    !!profile &&                // profile exists
    !profile.onboarding_completed && // DB says not done
    !tourDismissed              // local dismiss not set

  const title      = TITLES[pathname] || (pathname.startsWith('/ee/') ? 'Expression Écrite' : 'TCF Challenge')
  const showFooter = !NO_FOOTER_PATTERNS.some((re) => re.test(pathname))

  return (
    <div className="flex min-h-screen bg-surface dark:bg-surface-dark">
      {showTour && <OnboardingTour onDone={handleTourDone} />}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
          <div className="mx-auto max-w-7xl">
            <Suspense fallback={<ContentLoader />}>
              <Outlet />
            </Suspense>
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
      <AiChatWidget />
      <WhatsAppButton />
    </div>
  )
}

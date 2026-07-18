import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminRoute from './components/layout/AdminRoute'
import AppLayout from './components/layout/AppLayout'

// Login is needed immediately (it's usually the first screen), so it stays
// a normal import. Everything else loads on demand, split per route, so the
// first paint only ships the code the visitor actually needs right now.
import Login from './pages/Login'

const Signup = lazy(() => import('./pages/Signup'))
const PendingApproval = lazy(() => import('./pages/PendingApproval'))
const SuspendedAccount = lazy(() => import('./pages/SuspendedAccount'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ChallengeCalendar = lazy(() => import('./pages/ChallengeCalendar'))
const CO = lazy(() => import('./pages/CO'))
const COQuiz = lazy(() => import('./pages/COQuiz'))
const CE = lazy(() => import('./pages/CE'))
const CEQuiz = lazy(() => import('./pages/CEQuiz'))
const EE = lazy(() => import('./pages/EE'))
const EESujetWorkspace = lazy(() => import('./pages/EESujetWorkspace'))
const LearningCenter = lazy(() => import('./pages/LearningCenter'))
const ProgressCoach = lazy(() => import('./pages/ProgressCoach'))
const Statistics = lazy(() => import('./pages/Statistics'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminHome = lazy(() => import('./pages/admin/AdminHome'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminActivity = lazy(() => import('./pages/admin/AdminActivity'))
const AdminSujets = lazy(() => import('./pages/admin/AdminSujets'))
const AdminCO = lazy(() => import('./pages/admin/AdminCO'))
const AdminCE = lazy(() => import('./pages/admin/AdminCE'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
    </div>
  )
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/pending" element={<PendingApproval />} />
        <Route path="/suspended" element={<SuspendedAccount />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<ChallengeCalendar />} />
            <Route path="/co" element={<CO />} />
            <Route path="/co/:seriesNumber" element={<COQuiz />} />
            <Route path="/ce" element={<CE />} />
            <Route path="/ce/:seriesNumber" element={<CEQuiz />} />
            <Route path="/ee" element={<EE />} />
            <Route path="/ee/:sujetNumber" element={<EESujetWorkspace />} />
            <Route path="/learning-center" element={<LearningCenter />} />
            <Route path="/progress-coach" element={<ProgressCoach />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/profile" element={<Profile />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminHome />}>
                <Route index element={<Navigate to="/admin/users" replace />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="activity" element={<AdminActivity />} />
                <Route path="sujets" element={<AdminSujets />} />
                <Route path="co" element={<AdminCO />} />
                <Route path="ce" element={<AdminCE />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </>
  )
}

import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminRoute from './components/layout/AdminRoute'
import AppLayout from './components/layout/AppLayout'

import Login from './pages/Login'
import Signup from './pages/Signup'
import PendingApproval from './pages/PendingApproval'
import SuspendedAccount from './pages/SuspendedAccount'
import Dashboard from './pages/Dashboard'
import ChallengeCalendar from './pages/ChallengeCalendar'
import CO from './pages/CO'
import COQuiz from './pages/COQuiz'
import CE from './pages/CE'
import CEQuiz from './pages/CEQuiz'
import EE from './pages/EE'
import EESujetWorkspace from './pages/EESujetWorkspace'
import LearningCenter from './pages/LearningCenter'
import ProgressCoach from './pages/ProgressCoach'
import Statistics from './pages/Statistics'
import Recommendations from './pages/Recommendations'
import Profile from './pages/Profile'
import AdminHome from './pages/admin/AdminHome'
import AdminUsers from './pages/admin/AdminUsers'
import AdminActivity from './pages/admin/AdminActivity'
import AdminSujets from './pages/admin/AdminSujets'
import AdminCO from './pages/admin/AdminCO'
import AdminCE from './pages/admin/AdminCE'
import NotFound from './pages/NotFound'

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface dark:bg-surface-dark">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
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
    </>
  )
}

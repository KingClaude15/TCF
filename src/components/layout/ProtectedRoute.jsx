import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, loading, profileLoading, profile, isPending, isSuspended } = useAuth()
  const location = useLocation()

  // Show the full-screen spinner ONLY during the very first cold load
  // (auth state not yet resolved, or first profile fetch in progress).
  //
  // Once `profile` is populated, never show the spinner again — even if
  // `profileLoading` momentarily flips to true during a background refresh.
  // This is what stopped the "auto-refresh" flash: previously the spinner
  // replaced <Outlet> on every refreshProfile() call, unmounting the current
  // page entirely. Now the page stays mounted and visible while the profile
  // silently updates in the background.
  const showSpinner = loading || (profileLoading && !profile)

  if (showSpinner) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface dark:bg-surface-dark">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (isSuspended) return <Navigate to="/suspended" replace />
  if (isPending)   return <Navigate to="/pending"   replace />

  return <Outlet />
}

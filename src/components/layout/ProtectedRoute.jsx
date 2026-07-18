import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, loading, profileLoading, isPending, isSuspended } = useAuth()
  const location = useLocation()

  if (loading || (isAuthenticated && profileLoading)) {
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
  if (isPending) return <Navigate to="/pending" replace />

  return <Outlet />
}

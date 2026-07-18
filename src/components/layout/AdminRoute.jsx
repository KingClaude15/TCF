import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminRoute() {
  const { isAdmin, profileLoading } = useAuth()

  if (profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    )
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

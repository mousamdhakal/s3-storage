import { Navigate, Outlet } from 'react-router-dom'
import { useUserStore } from '../../store/user'

export const UnprotectedRoute = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />
}
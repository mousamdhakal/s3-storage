import { Navigate, Outlet } from 'react-router-dom'
import { useUserStore } from '../../store/user'

export const ProtectedRoute = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />
}
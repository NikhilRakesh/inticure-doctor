import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './authSlice'

export default function RoutesProtector() {
  const isAuthenticated = useAuthStore((state) => state.accessToken)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

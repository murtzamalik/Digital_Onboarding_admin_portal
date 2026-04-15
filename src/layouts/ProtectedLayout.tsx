import { Navigate, Outlet } from 'react-router-dom'
import { getAdminAccessToken } from '../auth/token'

export function ProtectedLayout() {
  if (!getAdminAccessToken()) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

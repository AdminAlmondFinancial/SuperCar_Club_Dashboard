import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/lib/auth'

export function RequireMember() {
  const { member, loading } = useAuth()
  if (loading) return <div className="min-h-dvh bg-paper" aria-busy="true" />
  if (!member) return <Navigate to="/sign-in" replace />
  return <Outlet />
}

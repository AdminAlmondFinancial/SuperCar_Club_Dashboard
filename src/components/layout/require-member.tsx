import { Navigate, Outlet } from 'react-router-dom'

import { PageLoading } from '@/components/ui/page-loading'
import { useAuth } from '@/lib/auth'

export function RequireMember() {
  const { member, loading } = useAuth()
  if (loading) return <PageLoading label="Checking your membership" />
  if (!member) return <Navigate to="/sign-in" replace />
  return <Outlet />
}

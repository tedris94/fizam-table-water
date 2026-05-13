'use client'

import { TeamView } from '@/components/dashboard/TeamView'
import { ForbiddenPanel } from '@/components/dashboard/ForbiddenPanel'
import { useAuth } from '@/contexts/AuthContext'

export default function TeamDashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="p-8 text-[#1a1f71]">Loading…</p>
  }

  if (!user || !['super_admin', 'admin', 'hr'].includes(user.role)) {
    return <ForbiddenPanel />
  }

  return <TeamView role={user.role} />
}

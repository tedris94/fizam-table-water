'use client'

import { ApplicationsView } from '@/components/dashboard/ApplicationsView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function ApplicationsPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="applications.manage">
      <ApplicationsView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

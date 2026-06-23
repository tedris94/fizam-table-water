'use client'

import { PagesManagementView } from '@/components/dashboard/PagesManagementView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function CmsPagesPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="cms.view">
      <PagesManagementView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

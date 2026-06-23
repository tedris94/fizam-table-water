'use client'

import { CareersView } from '@/components/dashboard/CareersView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function CareersPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="careers.manage">
      <CareersView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

'use client'

import { AnalyticsView } from '@/components/dashboard/AnalyticsView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function AnalyticsPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="analytics.view">
      <AnalyticsView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

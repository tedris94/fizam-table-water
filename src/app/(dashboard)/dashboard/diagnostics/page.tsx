'use client'

import { DiagnosticsView } from '@/components/dashboard/DiagnosticsView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function DiagnosticsPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="diagnostics.view">
      <DiagnosticsView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

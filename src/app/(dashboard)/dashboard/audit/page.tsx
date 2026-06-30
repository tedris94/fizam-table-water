'use client'

import { AuditLogView } from '@/components/dashboard/AuditLogView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function AuditPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="audit.view">
      <AuditLogView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

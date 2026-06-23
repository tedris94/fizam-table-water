'use client'

import { CMSView } from '@/components/dashboard/CMSView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function CmsPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="cms.view">
      <CMSView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

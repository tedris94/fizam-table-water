'use client'

import { SiteChromeView } from '@/components/dashboard/SiteChromeView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function CmsHeaderPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="cms.header.manage">
      <SiteChromeView role={user?.role ?? 'user'} kind="header" />
    </DashboardPageGuard>
  )
}

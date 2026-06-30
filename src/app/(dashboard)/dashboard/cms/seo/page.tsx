'use client'

import { SEOSettingsView } from '@/components/dashboard/SEOSettingsView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function CmsSeoPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="cms.seo.manage">
      <SEOSettingsView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

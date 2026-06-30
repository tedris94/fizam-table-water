'use client'

import { SiteChromeView } from '@/components/dashboard/SiteChromeView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function CmsFooterPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="cms.footer.manage">
      <SiteChromeView role={user?.role ?? 'user'} kind="footer" />
    </DashboardPageGuard>
  )
}

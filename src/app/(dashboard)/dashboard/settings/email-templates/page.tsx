'use client'

import { EmailTemplatesView } from '@/components/dashboard/EmailTemplatesView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function EmailTemplatesPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="email.templates">
      <EmailTemplatesView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

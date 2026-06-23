'use client'

import { SettingsView } from '@/components/dashboard/SettingsView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="settings.view">
      <SettingsView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

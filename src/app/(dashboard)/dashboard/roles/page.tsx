'use client'

import { RolesView } from '@/components/dashboard/RolesView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'

export default function RolesPage() {
  return (
    <DashboardPageGuard capability="roles.manage">
      <RolesView />
    </DashboardPageGuard>
  )
}

'use client'

import { UsersView } from '@/components/dashboard/UsersView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'

export default function UsersPage() {
  return (
    <DashboardPageGuard capability="users.manage">
      <UsersView />
    </DashboardPageGuard>
  )
}

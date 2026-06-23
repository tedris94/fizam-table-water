'use client'

import { OrganogramView } from '@/components/dashboard/OrganogramView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'

export default function OrganogramPage() {
  return (
    <DashboardPageGuard capability="organogram.view">
      <OrganogramView />
    </DashboardPageGuard>
  )
}

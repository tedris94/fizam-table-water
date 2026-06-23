'use client'

import { OrdersView } from '@/components/dashboard/OrdersView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function OrdersPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="orders.view">
      <OrdersView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

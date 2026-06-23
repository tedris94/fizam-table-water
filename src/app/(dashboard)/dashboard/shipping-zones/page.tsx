'use client'

import { ShippingZonesView } from '@/components/dashboard/ShippingZonesView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function ShippingZonesPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="shipping.view">
      <ShippingZonesView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

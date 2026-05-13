'use client'

import { OrdersView } from '@/components/dashboard/OrdersView'
import { ForbiddenPanel } from '@/components/dashboard/ForbiddenPanel'
import { useAuth } from '@/contexts/AuthContext'

export default function OrdersPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="p-8 text-[#1a1f71]">Loading…</p>
  }

  if (!user || !['super_admin', 'admin'].includes(user.role)) {
    return <ForbiddenPanel />
  }

  return <OrdersView role={user.role} />
}

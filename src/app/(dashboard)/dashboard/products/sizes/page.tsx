'use client'

import { ProductSizesView } from '@/components/dashboard/ProductSizesView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function ProductSizesPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="products.sizes">
      <ProductSizesView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

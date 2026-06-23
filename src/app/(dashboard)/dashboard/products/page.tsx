'use client'

import { ProductsView } from '@/components/dashboard/ProductsView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function ProductsPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="products.catalog">
      <ProductsView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

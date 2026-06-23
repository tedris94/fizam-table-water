'use client'

import { ProductCategoriesView } from '@/components/dashboard/ProductCategoriesView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function ProductCategoriesPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="products.categories">
      <ProductCategoriesView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

'use client'

import { ProductTagsView } from '@/components/dashboard/ProductTagsView'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function ProductTagsPage() {
  const { user } = useAuth()

  return (
    <DashboardPageGuard capability="products.tags">
      <ProductTagsView role={user?.role ?? 'user'} />
    </DashboardPageGuard>
  )
}

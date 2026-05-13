'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ForbiddenPanel } from '@/components/dashboard/ForbiddenPanel'
import { ShippingZonesView } from '@/components/dashboard/ShippingZonesView'

export default function ShippingZonesPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-lg text-[#1a1f71]">
        Loading delivery locations…
      </div>
    )
  }

  if (!user || !['super_admin', 'admin'].includes(user.role)) {
    return <ForbiddenPanel />
  }

  return <ShippingZonesView role={user.role} />
}

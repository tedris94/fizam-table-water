'use client'

import { SEOSettingsView } from '@/components/dashboard/SEOSettingsView'
import { ForbiddenPanel } from '@/components/dashboard/ForbiddenPanel'
import { useAuth } from '@/contexts/AuthContext'

export default function CMSSEOPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="p-8 text-[#1a1f71]">Loading…</p>
  }

  if (!user || !['super_admin', 'admin'].includes(user.role)) {
    return <ForbiddenPanel />
  }

  return <SEOSettingsView role={user.role} />
}

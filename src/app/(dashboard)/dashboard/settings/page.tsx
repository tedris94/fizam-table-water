'use client'

import { SettingsView } from '@/components/dashboard/SettingsView'
import { ForbiddenPanel } from '@/components/dashboard/ForbiddenPanel'
import { useAuth } from '@/contexts/AuthContext'

export default function SettingsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="p-8 text-[#1a1f71]">Loading…</p>
  }

  if (!user || !['super_admin', 'admin', 'hr', 'user'].includes(user.role)) {
    return <ForbiddenPanel />
  }

  return <SettingsView role={user.role} />
}

'use client'

import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { ForbiddenPanel } from '@/components/dashboard/ForbiddenPanel'
import { HRDashboard } from '@/components/dashboard/HRDashboard'
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard'
import { UserDashboard } from '@/components/dashboard/UserDashboard'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardHomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-lg text-[#1a1f71]">
        Loading dashboard…
      </div>
    )
  }

  if (!user) {
    return <ForbiddenPanel />
  }

  switch (user.role) {
    case 'super_admin':
      return <SuperAdminDashboard />
    case 'admin':
      return <AdminDashboard />
    case 'hr':
      return <HRDashboard />
    case 'customer':
      return <UserDashboard />
    default:
      return <UserDashboard />
  }
}

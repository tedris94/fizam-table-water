'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { HRDashboard } from '@/components/dashboard/HRDashboard'
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard'
import { UserDashboard } from '@/components/dashboard/UserDashboard'
import { DashboardPageGuard } from '@/components/dashboard/DashboardPageGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardHomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?signedOut=1')
    }
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-lg text-[#1a1f71]">
        {loading ? 'Loading dashboard…' : 'Redirecting to sign in…'}
      </div>
    )
  }

  return (
    <DashboardPageGuard capability="dashboard.home">
      {user.role === 'super_admin' ? (
        <SuperAdminDashboard />
      ) : user.role === 'admin' ? (
        <AdminDashboard />
      ) : user.role === 'hr' ? (
        <HRDashboard />
      ) : (
        <UserDashboard />
      )}
    </DashboardPageGuard>
  )
}

'use client'

import type { ReactNode } from 'react'
import { ForbiddenPanel } from './ForbiddenPanel'
import { useAuth } from '@/contexts/AuthContext'
import { hasAnyCapability, hasCapability } from '@/lib/capabilities'

type DashboardPageGuardProps = {
  capability: string | string[]
  children: ReactNode
}

export function DashboardPageGuard({ capability, children }: DashboardPageGuardProps) {
  const { loading, capabilities } = useAuth()

  if (loading) {
    return <p className="p-8 text-[#1a1f71]">Loading…</p>
  }

  const allowed = Array.isArray(capability)
    ? hasAnyCapability(capabilities, capability)
    : hasCapability(capabilities, capability)

  if (!allowed) return <ForbiddenPanel />

  return children
}

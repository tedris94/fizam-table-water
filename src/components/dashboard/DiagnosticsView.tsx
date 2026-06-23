'use client'

import { DashboardLayout } from './DashboardLayout'
import { DiagnosticsRunner } from '@/components/frontend/DiagnosticsRunner'

interface DiagnosticsViewProps {
  role?: string
}

export function DiagnosticsView({ role }: DiagnosticsViewProps) {
  return (
    <DashboardLayout title="Diagnostics" role={role}>
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-2xl text-[#1a1f71]">System diagnostics</h2>
          <p className="text-gray-600">
            Quick health checks for public APIs and core services. SMTP testing uses{' '}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">/api/diagnostics/email</code>{' '}
            with your <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">DIAGNOSTICS_KEY</code>.
          </p>
        </div>
        <DiagnosticsRunner />
      </div>
    </DashboardLayout>
  )
}

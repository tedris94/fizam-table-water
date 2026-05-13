'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ForbiddenPanel } from '@/components/dashboard/ForbiddenPanel'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { DiagnosticsRunner } from '@/components/frontend/DiagnosticsRunner'

export default function DiagnosticsDashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-lg text-[#1a1f71]">
        Loading diagnostics…
      </div>
    )
  }

  if (!user || user.role !== 'super_admin') {
    return <ForbiddenPanel />
  }

  return (
    <DashboardLayout title="System Diagnostics" role={user.role}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl text-[#1a1f71] mb-2">System Diagnostics</h2>
          <p className="text-gray-600">
            Live checks against the local Payload/Next.js server. Only visible to super admins.
          </p>
        </div>

        <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-2xl">
          <h3 className="text-lg text-[#1a1f71] mb-2 font-semibold flex items-center gap-2">
            ⚠️ Important Information
          </h3>
          <p className="text-gray-700 mb-3">
            If checks fail, your local Payload server may not be running or the SQLite database may
            not exist yet.
          </p>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-2 font-semibold">To resolve:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>
                Make sure the dev server is running:{' '}
                <code className="rounded bg-gray-100 px-1">pnpm dev</code>
              </li>
              <li>
                Drop orphan indexes if Payload crashed on startup:{' '}
                <code className="rounded bg-gray-100 px-1">pnpm fix-indexes</code>
              </li>
              <li>
                Seed demo data (optional):{' '}
                <code className="rounded bg-gray-100 px-1">pnpm seed</code>
              </li>
              <li>
                Reload this page and click <strong>Re-run Diagnostics</strong>.
              </li>
            </ol>
          </div>
        </div>

        <DiagnosticsRunner />
      </div>
    </DashboardLayout>
  )
}

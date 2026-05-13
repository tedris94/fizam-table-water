'use client'

import { useAuth } from '@/contexts/AuthContext'

export function ForbiddenPanel() {
  const { user } = useAuth()
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
      <p className="text-xl font-semibold text-[#1a1f71]">Access denied</p>
      <p className="max-w-md text-gray-600">
        {user
          ? 'Your account does not have permission to view this section.'
          : 'You must be signed in to view this page.'}
      </p>
    </div>
  )
}

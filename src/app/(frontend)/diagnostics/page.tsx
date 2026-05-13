import { redirect } from 'next/navigation'

/**
 * Diagnostics is now restricted to super admins inside the dashboard. Keep this
 * path as a soft redirect so any old bookmarks or links still land somewhere
 * useful (the auth flow will bounce unauthenticated visitors to /login).
 */
export const dynamic = 'force-dynamic'

export default function DiagnosticsRedirect() {
  redirect('/dashboard/diagnostics')
}

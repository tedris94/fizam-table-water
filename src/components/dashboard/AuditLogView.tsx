'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { Shield, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'

interface AuditLogViewProps {
  role: string
}

type AuditLog = {
  id: number | string
  action: 'create' | 'update' | 'delete' | 'login' | 'logout'
  collectionSlug?: string | null
  documentId?: string | null
  title?: string | null
  userEmail?: string | null
  userRole?: string | null
  ip?: string | null
  changes?: unknown
  createdAt: string
}

type ApiResponse = {
  docs: AuditLog[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

const ACTION_STYLES: Record<string, string> = {
  create: 'bg-green-50 text-green-700',
  update: 'bg-blue-50 text-blue-700',
  delete: 'bg-red-50 text-red-700',
  login: 'bg-purple-50 text-purple-700',
  logout: 'bg-gray-100 text-gray-700',
}

const COLLECTION_OPTIONS = [
  'users', 'products', 'orders', 'team-members', 'jobs', 'applications',
  'pages', 'shipping-zones', 'email-templates', 'dashboard-roles', 'media',
  'product-categories', 'product-sizes', 'product-tags',
]

export function AuditLogView({ role }: AuditLogViewProps) {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [action, setAction] = useState('')
  const [collection, setCollection] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (action) params.set('action', action)
      if (collection) params.set('collection', collection)
      if (q) params.set('q', q)
      params.set('page', String(page))
      params.set('limit', '25')
      const res = await fetch(`/api/dashboard/audit?${params.toString()}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load audit logs')
      setData((await res.json()) as ApiResponse)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [action, collection, q, page])

  useEffect(() => {
    void load()
  }, [load])

  // Reset to first page when filters change.
  useEffect(() => {
    setPage(1)
  }, [action, collection, q])

  return (
    <DashboardLayout title="Audit Trail" role={role}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl text-[#1a1f71]">Audit Trail</h2>
            <p className="text-gray-600">Every create, update, delete and sign-in across the dashboard.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none text-sm"
            >
              <option value="">All actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Collection</label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none text-sm"
            >
              <option value="">All collections</option>
              {COLLECTION_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Search (email, title, doc id)</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. admin@fizam.com"
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none text-sm"
            />
          </div>
          <button
            onClick={() => void load()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white text-sm hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-gray-600 text-sm w-8"></th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm">When</th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm">Action</th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm">Collection</th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm">Document</th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm">User</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-500">Loading…</td></tr>
                ) : !data || data.docs.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-500">No audit entries found.</td></tr>
                ) : (
                  data.docs.map((log) => {
                    const key = String(log.id)
                    const isOpen = expanded === key
                    const hasChanges = log.changes != null
                    return (
                      <Fragment key={key}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {hasChanges && (
                              <button
                                onClick={() => setExpanded(isOpen ? null : key)}
                                aria-label={isOpen ? 'Collapse details' : 'Expand details'}
                                className="text-gray-400 hover:text-[#2563eb]"
                              >
                                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${ACTION_STYLES[log.action] ?? 'bg-gray-100 text-gray-700'}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">{log.collectionSlug ?? '—'}</td>
                          <td className="py-3 px-4 text-sm text-[#1a1f71]">
                            {log.title || (log.documentId ? `#${log.documentId}` : '—')}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {log.userEmail || 'system'}
                            {log.userRole ? <span className="text-gray-400"> ({log.userRole})</span> : null}
                          </td>
                        </tr>
                        {isOpen && hasChanges && (
                          <tr className="bg-gray-50">
                            <td></td>
                            <td colSpan={5} className="py-3 px-4">
                              <pre className="text-xs bg-white border border-gray-200 rounded-lg p-3 overflow-x-auto max-h-72">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                              {log.ip && <div className="text-xs text-gray-400 mt-1">IP: {log.ip}</div>}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                Page {data.page} of {data.totalPages} · {data.totalDocs} entries
              </div>
              <div className="flex gap-2">
                <button
                  disabled={!data.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  disabled={!data.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

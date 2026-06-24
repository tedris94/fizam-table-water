'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { ALL_CAPABILITIES, type CapabilityDef } from '@/lib/capabilities'
import { canDeleteRole } from '@/lib/roleAssignments'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Save, Shield, Trash2, X } from 'lucide-react'

type DashboardRole = {
  id: number | string
  slug: string
  name: string
  description: string
  capabilities: string[]
  isSystem: boolean
}

export function RolesView() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  const [roles, setRoles] = useState<DashboardRole[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftCaps, setDraftCaps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createSlug, setCreateSlug] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const selected = roles.find((r) => r.slug === selectedSlug) ?? null

  const groupedCaps = useMemo(() => {
    const groups = new Map<string, CapabilityDef[]>()
    for (const def of ALL_CAPABILITIES) {
      const list = groups.get(def.group) ?? []
      list.push(def)
      groups.set(def.group, list)
    }
    return groups
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/dashboard-roles', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load roles')
      const data = (await res.json()) as DashboardRole[]
      setRoles(data)
      setSelectedSlug((prev) => prev ?? data[0]?.slug ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load roles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!selected) return
    setDraftName(selected.name)
    setDraftDescription(selected.description)
    setDraftCaps([...selected.capabilities])
    setNotice(null)
  }, [selected])

  function toggleCap(key: string) {
    setDraftCaps((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const res = await fetch(`/api/admin/dashboard-roles/${selected.slug}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draftName,
          description: draftDescription,
          capabilities: draftCaps,
        }),
      })
      const data = (await res.json()) as DashboardRole & { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to save role')

      setRoles((prev) => prev.map((r) => (r.slug === data.slug ? data : r)))
      setNotice('Role updated. Users with this role will see changes after they refresh.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/dashboard-roles', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName,
          slug: createSlug || undefined,
          description: createDescription,
        }),
      })
      const data = (await res.json()) as DashboardRole & { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to create role')

      setRoles((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setSelectedSlug(data.slug)
      setShowCreateModal(false)
      setCreateName('')
      setCreateSlug('')
      setCreateDescription('')
      setNotice(`Role "${data.name}" created. Assign capabilities below and save.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteRole(role: DashboardRole) {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/dashboard-roles/${role.slug}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete role')

      setRoles((prev) => prev.filter((r) => r.slug !== role.slug))
      setSelectedSlug((prev) => (prev === role.slug ? null : prev))
      setNotice(`Role "${role.name}" deleted.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const lockedCaps =
    selected?.slug === 'super_admin'
      ? ['users.manage', 'roles.manage', 'diagnostics.view']
      : []

  return (
    <DashboardLayout title="Roles">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="mb-2 text-2xl text-[#1a1f71]">Roles & capabilities</h2>
            <p className="text-gray-600">
              Control which dashboard sections each role can access. Super admins can add or remove
              custom roles.
            </p>
          </div>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a1f71] px-4 py-2 text-white hover:bg-[#0f1545]"
            >
              <Plus className="h-4 w-4" />
              Add role
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}
        {notice && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            {notice}
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading roles…</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <div className="space-y-1 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
              {roles.map((role) => (
                <button
                  key={role.slug}
                  type="button"
                  onClick={() => setSelectedSlug(role.slug)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    selectedSlug === role.slug
                      ? 'bg-[#1a1f71] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{role.name}</span>
                </button>
              ))}
            </div>

            {selected ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Display name</label>
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
                    <input
                      type="text"
                      value={selected.slug}
                      disabled
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                    <input
                      type="text"
                      value={draftDescription}
                      onChange={(e) => setDraftDescription(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <h3 className="mb-4 text-lg font-semibold text-[#1a1f71]">Capabilities</h3>
                <div className="space-y-6">
                  {[...groupedCaps.entries()].map(([group, caps]) => (
                    <div key={group}>
                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                        {group}
                      </h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {caps.map((cap) => {
                          const checked = draftCaps.includes(cap.key)
                          const locked = lockedCaps.includes(cap.key)
                          return (
                            <label
                              key={cap.key}
                              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${
                                checked ? 'border-[#1a1f71]/30 bg-blue-50/50' : 'border-gray-200'
                              } ${locked ? 'opacity-80' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={locked}
                                onChange={() => toggleCap(cap.key)}
                                className="mt-0.5"
                              />
                              <span>
                                <span className="block text-sm font-medium text-gray-900">{cap.label}</span>
                                <span className="mt-0.5 block font-mono text-[10px] text-gray-400">
                                  {cap.key}
                                </span>
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap justify-between gap-3">
                  {isSuperAdmin && canDeleteRole(selected) ? (
                    <button
                      type="button"
                      onClick={() => void handleDeleteRole(selected)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete role
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    disabled={saving || draftCaps.length === 0}
                    onClick={() => void handleSave()}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#1a1f71] px-4 py-2 text-white hover:bg-[#0f1545] disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving…' : 'Save role'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Select a role to edit.</p>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1a1f71]">New role</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} aria-label="Close">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={(e) => void handleCreateRole(e)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Display name</label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Warehouse staff"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Slug (optional)
                </label>
                <input
                  type="text"
                  value={createSlug}
                  onChange={(e) => setCreateSlug(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                  placeholder="warehouse"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-[#1a1f71] px-4 py-2 text-white hover:bg-[#0f1545] disabled:opacity-60"
                >
                  {creating ? 'Creating…' : 'Create role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

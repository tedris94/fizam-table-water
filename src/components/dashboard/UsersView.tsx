'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { Edit, Plus, Save, Trash2, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { filterAssignableRoles } from '@/lib/roleAssignments'

type DashboardUser = {
  id: number | string
  email: string
  fullName: string
  role: string
  createdAt?: string | null
}

type DashboardRole = {
  id: number | string
  slug: string
  name: string
}

type FormState = {
  email: string
  fullName: string
  role: string
  password: string
}

const EMPTY_FORM: FormState = {
  email: '',
  fullName: '',
  role: 'user',
  password: '',
}

export function UsersView() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<DashboardUser[]>([])
  const [roles, setRoles] = useState<DashboardRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<DashboardUser | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  const assignableRoles = useMemo(
    () => filterAssignableRoles(roles, currentUser?.role),
    [roles, currentUser?.role],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const usersRes = await fetch('/api/admin/users', { credentials: 'include' })
      if (!usersRes.ok) throw new Error('Failed to load users')
      const data = (await usersRes.json()) as
        | DashboardUser[]
        | { users: DashboardUser[]; roleOptions: DashboardRole[] }

      if (Array.isArray(data)) {
        setUsers(data)
      } else {
        setUsers(data.users)
        setRoles(data.roleOptions)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalError(null)
    setShowModal(true)
  }

  function openEdit(user: DashboardUser) {
    setEditing(user)
    setForm({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      password: '',
    })
    setModalError(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setModalError(null)
    try {
      if (editing) {
        const body: Record<string, string> = {
          email: form.email,
          fullName: form.fullName,
          role: form.role,
        }
        if (form.password.trim()) body.password = form.password.trim()

        const res = await fetch(`/api/admin/users/${editing.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = (await res.json()) as { error?: string }
        if (!res.ok) throw new Error(data.error ?? 'Failed to update user')
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = (await res.json()) as { error?: string }
        if (!res.ok) throw new Error(data.error ?? 'Failed to create user')
      }
      closeModal()
      await load()
    } catch (e) {
      setModalError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user: DashboardUser) {
    if (!confirm(`Delete ${user.fullName} (${user.email})?`)) return
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete user')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const roleLabel = (slug: string) => roles.find((r) => r.slug === slug)?.name ?? slug.replace(/_/g, ' ')

  return (
    <DashboardLayout title="Users">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="mb-2 text-2xl text-[#1a1f71]">User management</h2>
            <p className="text-gray-600">
              Create dashboard accounts and assign roles. Capabilities come from each role&apos;s
              settings.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1a1f71] px-4 py-2 text-white hover:bg-[#0f1545]"
          >
            <Plus className="h-4 w-4" />
            Add user
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading users…</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = String(currentUser?.id) === String(user.id)
                  return (
                    <tr key={String(user.id)} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium text-[#1a1f71]">{user.fullName}</td>
                      <td className="px-4 py-3 text-gray-700">{user.email}</td>
                      <td className="px-4 py-3 capitalize text-gray-700">{roleLabel(user.role)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
                            aria-label="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {!isSelf && user.role !== 'super_admin' && (
                            <button
                              type="button"
                              onClick={() => void handleDelete(user)}
                              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                              aria-label="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1a1f71]">
                {editing ? 'Edit user' : 'New user'}
              </h3>
              <button type="button" onClick={closeModal} aria-label="Close">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={form.role}
                  disabled={editing !== null && String(currentUser?.id) === String(editing.id)}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  {assignableRoles.length > 0
                    ? assignableRoles.map((r) => (
                        <option key={r.slug} value={r.slug}>
                          {r.name}
                        </option>
                      ))
                    : ['admin', 'hr', 'user', 'customer'].map((slug) => (
                        <option key={slug} value={slug}>
                          {slug.replace(/_/g, ' ')}
                        </option>
                      ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {editing ? 'New password (optional)' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!editing}
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder={editing ? 'Leave blank to keep current' : 'Min. 8 characters'}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1a1f71] px-4 py-2 text-white hover:bg-[#0f1545] disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

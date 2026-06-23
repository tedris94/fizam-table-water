'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, X, Save } from 'lucide-react'
import { DashboardLayout } from './DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'

type BaseItem = {
  id: number | string
  sortOrder?: number
  isActive?: boolean
}

type TaxonomyManagerProps<T extends BaseItem> = {
  role: string
  title: string
  description: string
  apiBase: string
  emptyLabel: string
  canDelete?: boolean
  renderRow: (item: T) => ReactNode
  buildForm: (item: T | null) => Record<string, unknown>
  renderFields: (
    form: Record<string, unknown>,
    setForm: (next: Record<string, unknown>) => void,
    editing: T | null,
  ) => ReactNode
  validate?: (form: Record<string, unknown>) => string | null
}

export function TaxonomyManagerView<T extends BaseItem>({
  role,
  title,
  description,
  apiBase,
  emptyLabel,
  canDelete: canDeleteProp,
  renderRow,
  buildForm,
  renderFields,
  validate,
}: TaxonomyManagerProps<T>) {
  const { hasCap } = useAuth()
  const canDelete = canDeleteProp ?? hasCap('products.delete')
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  useEffect(() => {
    void fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    try {
      const res = await fetch(apiBase, { credentials: 'include', cache: 'no-store' })
      if (!res.ok) throw new Error('Could not load items.')
      setItems((await res.json()) as T[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load.')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setModalError(null)
    setForm(buildForm(null))
    setShowModal(true)
  }

  function openEdit(item: T) {
    setEditing(item)
    setModalError(null)
    setForm(buildForm(item))
    setShowModal(true)
  }

  async function handleSave() {
    const validationError = validate?.(form)
    if (validationError) {
      setModalError(validationError)
      return
    }
    setSaving(true)
    setModalError(null)
    try {
      const url = editing ? `${apiBase}/${editing.id}` : apiBase
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Failed to save.')
      }
      await fetchItems()
      setShowModal(false)
    } catch (e) {
      setModalError(e instanceof Error ? e.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: T) {
    if (!confirm('Delete this item?')) return
    try {
      const res = await fetch(`${apiBase}/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Failed to delete.')
      }
      await fetchItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete.')
    }
  }

  return (
    <DashboardLayout title={title} role={role}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap gap-2 text-sm">
              <Link href="/dashboard/products" className="text-[#2563eb] hover:underline">
                ← Product catalog
              </Link>
            </div>
            <h2 className="text-2xl text-[#1a1f71]">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1f71] to-[#2563eb] px-6 py-3 text-white hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Add new
          </button>
        </div>

        {error && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center text-gray-500 shadow">
            {emptyLabel}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow">
            <table className="min-w-full text-sm">
              <tbody>
                {items.map((item) => (
                  <tr key={String(item.id)} className="border-b border-gray-100 last:border-0">
                    <td className="px-6 py-4">{renderRow(item)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-[#2563eb] hover:bg-blue-100"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => void handleDelete(item)}
                            className="rounded-lg bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between rounded-t-3xl border-b border-gray-200 bg-white px-6 py-6">
              <h3 className="text-xl text-[#1a1f71]">{editing ? 'Edit' : 'Add'}</h3>
              <button type="button" onClick={() => setShowModal(false)} aria-label="Close">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="space-y-5 p-6">
              {modalError && (
                <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {modalError}
                </div>
              )}
              {renderFields(form, setForm, editing)}
            </div>
            <div className="sticky bottom-0 flex justify-end gap-4 rounded-b-3xl border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border-2 border-gray-300 px-6 py-3 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1f71] to-[#2563eb] px-6 py-3 text-white disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-700">{label}</label>
      {children}
    </div>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-[#2563eb] focus:outline-none"
    />
  )
}

export function NumberInput({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-[#2563eb] focus:outline-none"
    />
  )
}

export function ActiveCheckbox({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      Active
    </label>
  )
}

export { Field }

'use client'

import { useEffect, useState } from 'react'
import { MapPin, Plus, Edit, Trash2, X, Save } from 'lucide-react'
import { DashboardLayout } from './DashboardLayout'

type Zone = {
  id: number | string
  name: string
  fee: number
  description?: string
  isActive?: boolean
  priority?: number
  states?: string[]
  cities?: string[]
  lgas?: string[]
}

type FormState = {
  name: string
  fee: number
  description: string
  states: string
  lgas: string
  cities: string
  priority: number
  isActive: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  fee: 0,
  description: '',
  states: '',
  lgas: '',
  cities: '',
  priority: 100,
  isActive: true,
}

interface ShippingZonesViewProps {
  role: string
}

export function ShippingZonesView({ role }: ShippingZonesViewProps) {
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchZones()
  }, [])

  async function fetchZones() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/shipping-zones', { credentials: 'include' })
      if (!res.ok) throw new Error('Could not load delivery locations.')
      const data = (await res.json()) as Zone[]
      setZones(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load.')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(zone: Zone) {
    setEditingZone(zone)
    setFormData({
      name: zone.name,
      fee: zone.fee,
      description: zone.description ?? '',
      states: (zone.states ?? []).join(', '),
      lgas: (zone.lgas ?? []).join(', '),
      cities: (zone.cities ?? []).join(', '),
      priority: zone.priority ?? 100,
      isActive: zone.isActive !== false,
    })
    setShowModal(true)
  }

  function handleAddNew() {
    setEditingZone(null)
    setFormData(EMPTY_FORM)
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: formData.name.trim(),
        fee: Number(formData.fee) || 0,
        description: formData.description,
        priority: Number(formData.priority) || 100,
        isActive: formData.isActive,
        states: formData.states
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        lgas: formData.lgas
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean),
        cities: formData.cities
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
      }
      const url = editingZone
        ? `/api/admin/shipping-zones/${editingZone.id}`
        : '/api/admin/shipping-zones'
      const res = await fetch(url, {
        method: editingZone ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save delivery location.')
      await fetchZones()
      setShowModal(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save delivery location.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(zone: Zone) {
    if (!confirm(`Delete the "${zone.name}" delivery location?`)) return
    try {
      const res = await fetch(`/api/admin/shipping-zones/${zone.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to delete delivery location.')
      await fetchZones()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete delivery location.')
    }
  }

  return (
    <DashboardLayout title="Delivery locations" role={role}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl text-[#1a1f71] mb-2">Delivery locations &amp; fees</h2>
            <p className="text-gray-600">
              Set fees by state, LGA, or city/area. Checkout collects a full Nigerian-style address
              (state → LGA → city/area → street), then picks the best matching rule.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add delivery location
          </button>
        </div>

        {error && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading delivery locations…</div>
        ) : zones.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-500">
            No delivery locations yet. Click <span className="font-semibold">Add delivery location</span>{' '}
            to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl text-[#1a1f71] mb-2">{zone.name}</h3>
                    <div className="text-3xl text-[#2563eb] font-semibold mb-2">
                      ₦{Number(zone.fee).toLocaleString()}
                    </div>
                    {zone.isActive === false && (
                      <span className="inline-block text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <MapPin className="w-8 h-8 text-[#2563eb]" />
                </div>

                {zone.description && (
                  <p className="text-sm text-gray-600 mb-4">{zone.description}</p>
                )}

                {zone.states && zone.states.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">States:</div>
                    <div className="flex flex-wrap gap-1">
                      {zone.states.slice(0, 3).map((state) => (
                        <span
                          key={state}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {state}
                        </span>
                      ))}
                      {zone.states.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{zone.states.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {zone.lgas && zone.lgas.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">LGAs:</div>
                    <div className="flex flex-wrap gap-1">
                      {zone.lgas.slice(0, 3).map((lga) => (
                        <span
                          key={lga}
                          className="text-xs bg-amber-100 text-amber-900 px-2 py-1 rounded"
                        >
                          {lga}
                        </span>
                      ))}
                      {zone.lgas.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{zone.lgas.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {zone.cities && zone.cities.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Cities / areas:</div>
                    <div className="flex flex-wrap gap-1">
                      {zone.cities.slice(0, 3).map((city) => (
                        <span
                          key={city}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                        >
                          {city}
                        </span>
                      ))}
                      {zone.cities.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{zone.cities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleEdit(zone)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-[#2563eb] rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(zone)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    aria-label={`Delete ${zone.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 md:px-8 py-6 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-xl md:text-2xl text-[#1a1f71]">
                {editingZone ? 'Edit delivery location' : 'Add delivery location'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Delivery location name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  placeholder="e.g. Lagos — mainland express"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Delivery Fee (₦) *</label>
                  <input
                    type="number"
                    value={formData.fee}
                    onChange={(e) =>
                      setFormData({ ...formData, fee: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: parseInt(e.target.value, 10) || 100 })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                    placeholder="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If several locations match the same address (same LGA, city, or state), the one
                    with the <strong>lowest</strong> priority number wins. Example: set 10 for
                    &quot;Victoria Island&quot; and 50 for &quot;All Lagos&quot;.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  States (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.states}
                  onChange={(e) => setFormData({ ...formData, states: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  placeholder="e.g., FCT, Lagos, Kano"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple states with commas.</p>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  LGAs (comma-separated, optional)
                </label>
                <input
                  type="text"
                  value={formData.lgas}
                  onChange={(e) => setFormData({ ...formData, lgas: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  placeholder="e.g. Ikeja, Eti-Osa"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If set, customers in these LGAs match this location before city or state-only rules.
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Cities / areas (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.cities}
                  onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  placeholder="e.g., Abuja, Kubwa, Gwagwalada"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used after LGA, before state. Match the wording customers use (e.g. Kubwa, Wuse).
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  rows={3}
                  placeholder="Internal notes (not shown to customers)"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 md:px-8 py-4 flex justify-end gap-4 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !formData.name || formData.fee <= 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving…' : 'Save location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

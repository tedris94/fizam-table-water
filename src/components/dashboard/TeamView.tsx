'use client'

import { useEffect, useRef, useState } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { Plus, Edit, Trash2, Mail, X, Save, Upload, ImageIcon } from 'lucide-react'
import { TeamMemberAvatar } from '@/components/frontend/TeamMemberAvatar'
import { useAuth } from '@/contexts/AuthContext'

type TeamMember = {
  id: number | string
  name: string
  position: string
  department: string
  bio: string
  email: string
  linkedin: string
  twitter: string
  sortOrder: number
  photoId?: number | string | null
  photoUrl?: string | null
}

type FormState = {
  name: string
  position: string
  department: string
  bio: string
  email: string
  linkedin: string
  twitter: string
  sortOrder: number
}

interface TeamViewProps {
  role: string
}

const EMPTY_FORM: FormState = {
  name: '',
  position: '',
  department: '',
  bio: '',
  email: '',
  linkedin: '',
  twitter: '',
  sortOrder: 0,
}

export function TeamView({ role }: TeamViewProps) {
  const { hasCap } = useAuth()
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null)
  const [photoRemoved, setPhotoRemoved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewObjectUrlRef = useRef<string | null>(null)

  const canDelete = hasCap('team.delete')

  function revokePreviewUrl() {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current)
      previewObjectUrlRef.current = null
    }
  }

  function resetPhotoState(member?: TeamMember | null) {
    revokePreviewUrl()
    setPendingPhotoFile(null)
    setPhotoRemoved(false)
    setPhotoPreviewUrl(member?.photoUrl ?? null)
  }

  useEffect(() => () => revokePreviewUrl(), [])

  useEffect(() => {
    void fetchTeam()
  }, [])

  async function fetchTeam() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/team-members', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Could not load team members.')
      const data = (await response.json()) as TeamMember[]
      setTeam(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load team members.')
    } finally {
      setLoading(false)
    }
  }

  function memberToForm(member: TeamMember): FormState {
    return {
      name: member.name,
      position: member.position,
      department: member.department,
      bio: member.bio,
      email: member.email,
      linkedin: member.linkedin,
      twitter: member.twitter,
      sortOrder: member.sortOrder,
    }
  }

  function handleAddNew() {
    setEditingMember(null)
    setModalError(null)
    setFormData(EMPTY_FORM)
    resetPhotoState(null)
    setShowModal(true)
  }

  function handleEdit(member: TeamMember) {
    setEditingMember(member)
    setModalError(null)
    setFormData(memberToForm(member))
    resetPhotoState(member)
    setShowModal(true)
  }

  function handlePhotoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setModalError('Please choose a JPG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setModalError('Image must be 5 MB or smaller.')
      return
    }
    revokePreviewUrl()
    const objectUrl = URL.createObjectURL(file)
    previewObjectUrlRef.current = objectUrl
    setPendingPhotoFile(file)
    setPhotoPreviewUrl(objectUrl)
    setPhotoRemoved(false)
    setModalError(null)
  }

  function handleRemovePhoto() {
    revokePreviewUrl()
    setPendingPhotoFile(null)
    setPhotoPreviewUrl(null)
    setPhotoRemoved(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadPhoto(file: File, alt: string) {
    const body = new FormData()
    body.append('file', file)
    body.append('alt', alt)
    const res = await fetch('/api/admin/media', {
      method: 'POST',
      credentials: 'include',
      body,
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      throw new Error(data?.error ?? 'Failed to upload photo.')
    }
    return (await res.json()) as { id: number | string; url?: string | null }
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.position.trim()) {
      setModalError('Name and position are required.')
      return
    }
    setSaving(true)
    setModalError(null)
    try {
      let photoId: number | string | null | undefined
      if (pendingPhotoFile) {
        const uploaded = await uploadPhoto(
          pendingPhotoFile,
          `${formData.name.trim() || 'Team member'} photo`,
        )
        photoId = uploaded.id
      } else if (photoRemoved) {
        photoId = null
      }

      const payload: Record<string, unknown> = {
        name: formData.name.trim(),
        position: formData.position.trim(),
        department: formData.department.trim(),
        bio: formData.bio.trim(),
        email: formData.email.trim(),
        linkedin: formData.linkedin.trim(),
        twitter: formData.twitter.trim(),
        sortOrder: Number(formData.sortOrder) || 0,
      }
      if (photoId !== undefined) payload.photoId = photoId
      const url = editingMember
        ? `/api/admin/team-members/${editingMember.id}`
        : '/api/admin/team-members'
      const res = await fetch(url, {
        method: editingMember ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Failed to save team member.')
      }
      const saved = (await res.json()) as TeamMember
      setTeam((prev) =>
        editingMember
          ? prev.map((m) => (String(m.id) === String(saved.id) ? saved : m))
          : [...prev, saved].sort((a, b) => a.sortOrder - b.sortOrder),
      )
      setShowModal(false)
      revokePreviewUrl()
    } catch (e) {
      setModalError(e instanceof Error ? e.message : 'Failed to save team member.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(member: TeamMember) {
    if (!confirm(`Delete ${member.name}?`)) return
    try {
      const res = await fetch(`/api/admin/team-members/${member.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Failed to delete team member.')
      }
      setTeam((prev) => prev.filter((m) => String(m.id) !== String(member.id)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete team member.')
    }
  }

  return (
    <DashboardLayout title="Team Management" role={role}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl text-[#1a1f71] mb-2">Team Members</h2>
            <p className="text-gray-600">Manage your organization&apos;s team</p>
          </div>
          <button
            type="button"
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </div>

        {error && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading team members...</div>
          </div>
        ) : team.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-500">
            No team members yet. Click <span className="font-semibold">Add Member</span> to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="text-center mb-4">
                  <TeamMemberAvatar
                    name={member.name}
                    photoUrl={member.photoUrl}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                    initialsClassName="text-2xl"
                  />
                  <h3 className="text-xl text-[#1a1f71] mb-1">{member.name}</h3>
                  <div className="text-sm text-[#2563eb] font-medium mb-2">{member.position}</div>
                  <div className="text-sm text-gray-600">{member.department || '—'}</div>
                </div>

                <div className="space-y-2 mb-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{member.email || 'No email'}</span>
                  </div>
                  {member.bio && (
                    <p className="text-sm text-gray-500 line-clamp-2">{member.bio}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(member)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-[#2563eb] rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(member)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      aria-label={`Delete ${member.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-6 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-xl text-[#1a1f71]">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
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

            <div className="p-6 space-y-4">
              {modalError && (
                <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-700 mb-2">Photo</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-4">
                  <TeamMemberAvatar
                    name={formData.name || 'Team member'}
                    photoUrl={photoPreviewUrl}
                    className="w-24 h-24 rounded-full shrink-0"
                    initialsClassName="text-2xl"
                  />
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#1a1f71] hover:border-[#2563eb] transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      {photoPreviewUrl ? 'Change photo' : 'Upload photo'}
                    </button>
                    {photoPreviewUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="block text-sm text-red-600 hover:underline"
                      >
                        Remove photo (use initials)
                      </button>
                    )}
                    <p className="text-xs text-gray-500 flex items-start gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      Square or portrait JPG/PNG/WebP, max 5 MB. If no photo is set, initials appear on the public team page.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Position *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Twitter / X URL</label>
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Sort order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: Number(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

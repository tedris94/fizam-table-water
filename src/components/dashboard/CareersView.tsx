'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { Briefcase, Plus, Edit, Trash2, MapPin, DollarSign, Clock, X, Save } from 'lucide-react'
import { slugFromJobTitle } from '@/lib/jobApi'
import { useAuth } from '@/contexts/AuthContext'

type Job = {
  id: number | string
  title: string
  slug: string
  department: string
  location: string
  type: string
  salaryRange: string
  description: string
  requirements: string[]
  postedDate?: string | null
  status: 'active' | 'closed'
}

type FormState = {
  title: string
  slug: string
  department: string
  location: string
  type: string
  salaryRange: string
  description: string
  requirementsText: string
  postedDate: string
  status: 'active' | 'closed'
}

interface CareersViewProps {
  role: string
}

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  department: '',
  location: '',
  type: 'Full-time',
  salaryRange: '',
  description: '',
  requirementsText: '',
  postedDate: new Date().toISOString().slice(0, 16),
  status: 'active',
}

function requirementsToText(items: string[]) {
  return items.join('\n')
}

function textToRequirements(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function jobToForm(job: Job): FormState {
  return {
    title: job.title,
    slug: job.slug,
    department: job.department,
    location: job.location,
    type: job.type,
    salaryRange: job.salaryRange,
    description: job.description,
    requirementsText: requirementsToText(job.requirements),
    postedDate: job.postedDate
      ? new Date(job.postedDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    status: job.status,
  }
}

export function CareersView({ role }: CareersViewProps) {
  const { hasCap } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  const canDelete = hasCap('careers.manage')

  useEffect(() => {
    void fetchJobs()
  }, [])

  async function fetchJobs() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/jobs', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Could not load job postings.')
      setJobs((await response.json()) as Job[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load jobs.')
    } finally {
      setLoading(false)
    }
  }

  function handleAddNew() {
    setEditingJob(null)
    setModalError(null)
    setFormData(EMPTY_FORM)
    setShowModal(true)
  }

  function handleEdit(job: Job) {
    setEditingJob(job)
    setModalError(null)
    setFormData(jobToForm(job))
    setShowModal(true)
  }

  function handleTitleChange(title: string) {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: editingJob ? prev.slug : slugFromJobTitle(title),
    }))
  }

  async function handleSave() {
    if (
      !formData.title.trim() ||
      !formData.department.trim() ||
      !formData.location.trim() ||
      !formData.type.trim() ||
      !formData.description.trim()
    ) {
      setModalError('Title, department, location, type, and description are required.')
      return
    }

    setSaving(true)
    setModalError(null)
    try {
      const payload = {
        title: formData.title.trim(),
        slug: (formData.slug.trim() || slugFromJobTitle(formData.title)).toLowerCase(),
        department: formData.department.trim(),
        location: formData.location.trim(),
        type: formData.type.trim(),
        salaryRange: formData.salaryRange.trim(),
        description: formData.description.trim(),
        requirements: textToRequirements(formData.requirementsText),
        postedDate: formData.postedDate
          ? new Date(formData.postedDate).toISOString()
          : new Date().toISOString(),
        status: formData.status,
      }

      const url = editingJob ? `/api/admin/jobs/${editingJob.id}` : '/api/admin/jobs'
      const res = await fetch(url, {
        method: editingJob ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Failed to save job.')
      }
      const saved = (await res.json()) as Job
      setJobs((prev) =>
        editingJob
          ? prev.map((j) => (String(j.id) === String(saved.id) ? saved : j))
          : [saved, ...prev],
      )
      setShowModal(false)
    } catch (e) {
      setModalError(e instanceof Error ? e.message : 'Failed to save job.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(job: Job) {
    if (!confirm(`Delete "${job.title}"?`)) return
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Failed to delete job.')
      }
      setJobs((prev) => prev.filter((j) => String(j.id) !== String(job.id)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete job.')
    }
  }

  return (
    <DashboardLayout title="Careers Management" role={role}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl text-[#1a1f71] mb-2">Job Postings</h2>
            <p className="text-gray-600">Manage job openings and vacancies</p>
          </div>
          <button
            type="button"
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>

        {error && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Total Jobs</div>
            <div className="text-3xl text-[#1a1f71]">{jobs.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Active</div>
            <div className="text-3xl text-green-600">
              {jobs.filter((j) => j.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Closed</div>
            <div className="text-3xl text-gray-600">
              {jobs.filter((j) => j.status === 'closed').length}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading job postings...</div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-500">
            No job postings yet. Click <span className="font-semibold">Post New Job</span> to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl text-[#1a1f71] mb-1">{job.title}</h3>
                        <p className="text-xs text-gray-400 mb-2">{job.department}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salaryRange || '—'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.type}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>

                    {job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.slice(0, 3).map((req, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 text-[#2563eb] text-xs rounded-full"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <span
                      className={`px-4 py-2 rounded-lg text-sm font-medium text-center ${
                        job.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {job.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEdit(job)}
                      className="px-4 py-2 bg-blue-50 text-[#2563eb] rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => void handleDelete(job)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        aria-label={`Delete ${job.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-6 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-xl text-[#1a1f71]">
                {editingJob ? 'Edit Job Posting' : 'Post New Job'}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Job title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">URL slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'active' | 'closed',
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Department *</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Job type *</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Full-time"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Salary range</label>
                  <input
                    type="text"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    placeholder="₦100,000 - ₦180,000/month"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Posted date</label>
                  <input
                    type="datetime-local"
                    value={formData.postedDate}
                    onChange={(e) => setFormData({ ...formData, postedDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Requirements</label>
                <textarea
                  value={formData.requirementsText}
                  onChange={(e) =>
                    setFormData({ ...formData, requirementsText: e.target.value })
                  }
                  rows={5}
                  placeholder="One requirement per line"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none resize-y"
                />
                <p className="mt-1 text-xs text-gray-500">Enter one requirement per line.</p>
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

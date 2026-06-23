'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from './DashboardLayout'
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  X,
  Trash2,
  Mail,
} from 'lucide-react'
import type { ApplicationStatus } from '@/lib/applicationRef'
import type { EducationEntry, WorkEntry } from '@/lib/applicationApi'
import { useAuth } from '@/contexts/AuthContext'

type Application = {
  id: number | string
  applicationRef: string
  jobTitle: string
  fullName: string
  email: string
  phone: string
  address: string
  education: string
  experience: string
  coverLetter: string
  professionalSummary: string
  motivationStatement: string
  educationHistory: EducationEntry[]
  workHistory: WorkEntry[]
  resumeUrl: string | null
  status: ApplicationStatus
  createdAt: string
}

interface ApplicationsViewProps {
  role: string
}

export function ApplicationsView({ role }: ApplicationsViewProps) {
  const { hasCap } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Application | null>(null)
  const [updating, setUpdating] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [modalNotice, setModalNotice] = useState<string | null>(null)

  const canDelete = hasCap('applications.delete')

  useEffect(() => {
    void fetchApplications()
  }, [])

  async function fetchApplications() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/applications', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Could not load applications.')
      setApplications((await response.json()) as Application[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load applications.')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(
    id: number | string,
    status: Application['status'],
    options?: { resendNotification?: boolean },
  ) {
    setUpdating(true)
    setModalError(null)
    setModalNotice(null)
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status,
          ...(options?.resendNotification ? { resendNotification: true } : {}),
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Failed to update status.')
      }
      const updated = (await res.json()) as Application & {
        emailSent?: boolean
        emailError?: string
      }
      const { emailSent, emailError, ...application } = updated
      setApplications((prev) =>
        prev.map((a) => (String(a.id) === String(application.id) ? application : a)),
      )
      setSelected(application)

      if (emailError) {
        setModalError(
          `Status saved, but the applicant email could not be sent: ${emailError}`,
        )
      } else if (emailSent) {
        setModalNotice(
          `Email accepted by the mail server for ${application.email}. If the applicant does not see it within a few minutes, ask them to check Spam/Promotions.`,
        )
      } else if (options?.resendNotification) {
        setModalNotice('No notification was sent for this action.')
      }
    } catch (e) {
      setModalError(e instanceof Error ? e.message : 'Failed to update status.')
    } finally {
      setUpdating(false)
    }
  }

  async function resendNotification(app: Application) {
    await updateStatus(app.id, app.status, { resendNotification: true })
  }

  async function handleDelete(app: Application) {
    if (!confirm(`Delete application from ${app.fullName}?`)) return
    try {
      const res = await fetch(`/api/admin/applications/${app.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Failed to delete application.')
      }
      setApplications((prev) => prev.filter((a) => String(a.id) !== String(app.id)))
      setSelected(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete application.')
    }
  }

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'shortlisted':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    const styles: Record<ApplicationStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      shortlisted: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <DashboardLayout title="Applications Management" role={role}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl text-[#1a1f71] mb-2">Job Applications</h2>
          <p className="text-gray-600">Review and manage candidate applications</p>
        </div>

        {error && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Total Applications</div>
            <div className="text-3xl text-[#1a1f71]">{applications.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Pending</div>
            <div className="text-3xl text-yellow-600">
              {applications.filter((a) => a.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Shortlisted</div>
            <div className="text-3xl text-blue-600">
              {applications.filter((a) => a.status === 'shortlisted').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Approved</div>
            <div className="text-3xl text-green-600">
              {applications.filter((a) => a.status === 'approved').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Rejected</div>
            <div className="text-3xl text-red-600">
              {applications.filter((a) => a.status === 'rejected').length}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading applications...</div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500">No applications found</div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Applicant</th>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Position</th>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Email</th>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Phone</th>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Applied On</th>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="text-[#1a1f71] font-medium">{app.fullName}</div>
                        {app.applicationRef && (
                          <div className="text-xs text-gray-400 mt-0.5">{app.applicationRef}</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[#1a1f71]">{app.jobTitle || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-600 text-sm">{app.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-600 text-sm">{app.phone}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-600 text-sm">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(app.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(app.status)}`}
                          >
                            {app.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setModalError(null)
                              setSelected(app)
                            }}
                            className="p-2 text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors"
                            title="View application"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Download resume"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-6 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="text-xl text-[#1a1f71]">{selected.fullName}</h3>
                <p className="text-sm text-gray-500">{selected.jobTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {modalError && (
                <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {modalError}
                </div>
              )}
              {modalNotice && (
                <div className="rounded-lg border-2 border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  {modalNotice}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={updating || selected.status === 'shortlisted'}
                  onClick={() => void updateStatus(selected.id, 'shortlisted')}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Shortlist
                </button>
                <button
                  type="button"
                  disabled={updating || selected.status === 'approved'}
                  onClick={() => void updateStatus(selected.id, 'approved')}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
                <button
                  type="button"
                  disabled={updating || selected.status === 'rejected'}
                  onClick={() => void updateStatus(selected.id, 'rejected')}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => void resendNotification(selected)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#2563eb] px-4 py-2 text-sm text-[#2563eb] hover:bg-blue-50 disabled:opacity-50"
                >
                  <Mail className="h-4 w-4" />
                  Resend email
                </button>
                <button
                  type="button"
                  disabled={updating || selected.status === 'pending'}
                  onClick={() => void updateStatus(selected.id, 'pending')}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Clock className="h-4 w-4" />
                  Mark pending
                </button>
                {selected.resumeUrl && (
                  <a
                    href={selected.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#2563eb] px-4 py-2 text-sm text-[#2563eb] hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4" />
                    Download CV file
                  </a>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => void handleDelete(selected)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>

              <section className="rounded-xl bg-slate-50 p-4 text-sm space-y-1">
                {selected.applicationRef && (
                  <p>
                    <span className="font-medium text-gray-700">Reference:</span>{' '}
                    {selected.applicationRef}
                  </p>
                )}
                <p>
                  <span className="font-medium text-gray-700">Email:</span> {selected.email}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Phone:</span> {selected.phone}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Address:</span> {selected.address || '—'}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Applied:</span>{' '}
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </section>

              {(selected.educationHistory.length > 0 || selected.education) && (
                <section>
                  <h4 className="font-semibold text-[#1a1f71] mb-3">Education</h4>
                  {selected.educationHistory.length > 0 ? (
                    <ul className="space-y-3">
                      {selected.educationHistory.map((edu, i) => (
                        <li key={i} className="rounded-xl border border-gray-200 p-4 text-sm">
                          <p className="font-medium text-[#1a1f71]">
                            {edu.qualification} — {edu.institution}
                          </p>
                          <p className="text-gray-600">
                            {[edu.fieldOfStudy, edu.startYear && edu.endYear ? `${edu.startYear} – ${edu.endYear}` : edu.startYear || edu.endYear, edu.grade ? `Grade: ${edu.grade}` : '']
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-slate-50 p-4 rounded-xl">
                      {selected.education}
                    </pre>
                  )}
                </section>
              )}

              {(selected.workHistory.length > 0 || selected.experience) && (
                <section>
                  <h4 className="font-semibold text-[#1a1f71] mb-3">Work experience</h4>
                  {selected.workHistory.length > 0 ? (
                    <ul className="space-y-3">
                      {selected.workHistory.map((work, i) => (
                        <li key={i} className="rounded-xl border border-gray-200 p-4 text-sm">
                          <p className="font-medium text-[#1a1f71]">
                            {work.jobTitle} — {work.company}
                          </p>
                          <p className="text-gray-600">
                            {[work.location, work.current ? `${work.startDate || ''} – Present` : [work.startDate, work.endDate].filter(Boolean).join(' – ')]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                          {work.description && (
                            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{work.description}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-slate-50 p-4 rounded-xl">
                      {selected.experience}
                    </pre>
                  )}
                </section>
              )}

              <section>
                <h4 className="font-semibold text-[#1a1f71] mb-3">Cover letter</h4>
                {selected.professionalSummary || selected.motivationStatement ? (
                  <div className="space-y-4 text-sm">
                    {selected.professionalSummary && (
                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                          Professional summary
                        </p>
                        <p className="text-gray-700 whitespace-pre-wrap">{selected.professionalSummary}</p>
                      </div>
                    )}
                    {selected.motivationStatement && (
                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                          Why this role
                        </p>
                        <p className="text-gray-700 whitespace-pre-wrap">{selected.motivationStatement}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-slate-50 p-4 rounded-xl">
                    {selected.coverLetter}
                  </pre>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

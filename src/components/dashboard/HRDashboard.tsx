'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from './DashboardLayout'
import {
  Users,
  Briefcase,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react'

export function HRDashboard() {
  const [stats, setStats] = useState({
    totalTeam: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    newApplicationsToday: 0,
  })
  const [recentApplications, setRecentApplications] = useState<
    {
      id: number | string
      full_name: string
      job_title?: string | null
      created_at: string
      status?: string
    }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/hr', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setRecentApplications(data.recentApplications || [])
        }
      } catch (error) {
        console.error('Error fetching HR dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    void fetchDashboardData()
  }, [])

  return (
    <DashboardLayout title="HR Dashboard" role="hr">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Team Members</p>
                <p className="text-3xl text-[#1a1f71]">{stats.totalTeam}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-500">Active employees</div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Active Jobs</p>
                <p className="text-3xl text-[#1a1f71]">{stats.activeJobs}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-500">Open positions</div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Applications</p>
                <p className="text-3xl text-[#1a1f71]">{stats.totalApplications}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-500">{stats.newApplicationsToday} new today</div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Pending Review</p>
                <p className="text-3xl text-[#1a1f71]">{stats.pendingApplications}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-500">Needs attention</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 flex items-center gap-2 text-xl text-[#1a1f71]">
            <FileText className="h-5 w-5" />
            Recent Applications
          </h3>
          {loading ? (
            <p className="py-8 text-center text-gray-500">Loading...</p>
          ) : recentApplications.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No recent applications</p>
          ) : (
            <div className="space-y-3">
              {recentApplications.slice(0, 5).map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <div className="text-[#1a1f71]">{application.full_name}</div>
                    <div className="text-sm text-gray-600">{application.job_title}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      Applied: {new Date(application.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        application.status === 'pending'
                          ? 'bg-orange-100 text-orange-700'
                          : application.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {application.status}
                    </span>
                    <a
                      href="/dashboard/applications"
                      className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm text-white transition-colors hover:bg-[#1a1f71]"
                    >
                      Review
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          <a
            href="/dashboard/applications"
            className="mt-4 block text-center text-[#2563eb] hover:underline"
          >
            View All Applications →
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-xl text-[#1a1f71]">Job Management</h3>
            <div className="space-y-3">
              <a
                href="/dashboard/careers"
                className="block rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 transition-all hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-[#2563eb]" />
                    <span className="text-[#1a1f71]">Manage Job Postings</span>
                  </div>
                  <span className="text-[#2563eb]">{stats.activeJobs}</span>
                </div>
              </a>
              <a
                href="/dashboard/team"
                className="block rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 transition-all hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-[#1a1f71]">Manage Team</span>
                  </div>
                  <span className="text-purple-600">{stats.totalTeam}</span>
                </div>
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-xl text-[#1a1f71]">Application Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-orange-50 p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-[#1a1f71]">Pending</span>
                </div>
                <span className="text-orange-600">{stats.pendingApplications}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-green-50 p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-[#1a1f71]">Approved</span>
                </div>
                <span className="text-green-600">{stats.approvedApplications}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="text-[#1a1f71]">Total</span>
                </div>
                <span className="text-gray-600">{stats.totalApplications}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#1a1f71] to-[#2563eb] p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-2 text-2xl">Company Organogram</h3>
              <p className="text-blue-200">View organizational structure and hierarchy</p>
            </div>
            <a
              href="/dashboard/organogram"
              className="rounded-full bg-white px-6 py-3 text-[#1a1f71] transition-colors hover:bg-blue-50"
            >
              View Organogram →
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

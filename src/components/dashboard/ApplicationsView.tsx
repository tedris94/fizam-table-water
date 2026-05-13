'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { FileText, Clock, CheckCircle, XCircle, Eye, Download } from 'lucide-react'

interface ApplicationsViewProps {
  role: string
}

export function ApplicationsView({ role }: ApplicationsViewProps) {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications?limit=500&sort=-createdAt&depth=1', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        const mapped = (data.docs ?? []).map((a: Record<string, unknown>) => ({
          ...a,
          full_name: a.fullName,
          job_title: a.jobTitle,
          created_at: a.createdAt,
        }))
        setApplications(mapped)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <DashboardLayout title="Applications Management" role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl text-[#1a1f71] mb-2">Job Applications</h2>
          <p className="text-gray-600">Review and manage candidate applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Total Applications</div>
            <div className="text-3xl text-[#1a1f71]">{applications.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Pending</div>
            <div className="text-3xl text-yellow-600">
              {applications.filter(a => a.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Approved</div>
            <div className="text-3xl text-green-600">
              {applications.filter(a => a.status === 'approved').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Rejected</div>
            <div className="text-3xl text-red-600">
              {applications.filter(a => a.status === 'rejected').length}
            </div>
          </div>
        </div>

        {/* Applications List */}
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
                        <div className="text-[#1a1f71] font-medium">{app.full_name}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[#1a1f71]">{app.job_title || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-600 text-sm">{app.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-600 text-sm">{app.phone}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-600 text-sm">
                          {new Date(app.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(app.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(app.status)}`}>
                            {app.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button className="p-2 text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
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
    </DashboardLayout>
  );
}

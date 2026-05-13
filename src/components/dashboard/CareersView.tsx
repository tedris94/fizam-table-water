import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Briefcase, Plus, Edit, Trash2, MapPin, DollarSign, Clock } from 'lucide-react';
interface CareersViewProps {
  role: string;
}

export function CareersView({ role }: CareersViewProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs?limit=500')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.docs ?? [])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Careers Management" role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl text-[#1a1f71] mb-2">Job Postings</h2>
            <p className="text-gray-600">Manage job openings and vacancies</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Total Jobs</div>
            <div className="text-3xl text-[#1a1f71]">{jobs.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Active</div>
            <div className="text-3xl text-green-600">
              {jobs.filter(j => j.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Closed</div>
            <div className="text-3xl text-gray-600">
              {jobs.filter(j => j.status === 'closed').length}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading job postings...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl text-[#1a1f71] mb-1">{job.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.type}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {job.requirements?.slice(0, 3).map((req: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-[#2563eb] text-xs rounded-full">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <span className={`px-4 py-2 rounded-lg text-sm font-medium text-center ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {job.status}
                    </span>
                    <button className="px-4 py-2 bg-blue-50 text-[#2563eb] rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

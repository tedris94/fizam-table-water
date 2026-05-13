'use client'

import { useState, useMemo } from 'react'
import { Briefcase, MapPin, Clock, DollarSign, Calendar } from 'lucide-react'

export type JobCard = {
  id: string
  slug: string
  title: string
  department: string
  location: string
  type: string
  salaryRange: string
  description: string
  requirements: string[]
  postedDate: string
}

export function CareersList({ jobs }: { jobs: JobCard[] }) {
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  const departments = useMemo(
    () => ['all', ...Array.from(new Set(jobs.map((j) => j.department)))],
    [jobs],
  )
  const filtered = useMemo(
    () => (selectedDepartment === 'all' ? jobs : jobs.filter((j) => j.department === selectedDepartment)),
    [selectedDepartment, jobs],
  )

  return (
    <>
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {departments.map((dept) => (
          <button
            key={dept}
            type="button"
            onClick={() => setSelectedDepartment(dept)}
            className={`px-6 py-2 rounded-full transition-all ${
              selectedDepartment === dept
                ? 'bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#2563eb]'
            }`}
          >
            {dept === 'all' ? 'All Departments' : dept}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500 shadow">
            No open positions in this department right now — please check back soon.
          </div>
        )}
        {filtered.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-2xl text-[#1a1f71] mb-2">{job.title}</h3>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.department}</span>
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{job.type}</span>
                  </div>
                  {job.salaryRange && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salaryRange}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{job.description}</p>
                {job.requirements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-[#1a1f71] mb-2">Requirements:</h4>
                    <ul className="space-y-1">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-600">
                          <div className="w-1.5 h-1.5 bg-[#2563eb] rounded-full mt-2"></div>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <a
                  href={`/careers/${job.slug}/apply`}
                  className="bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white px-8 py-4 rounded-full hover:shadow-lg transition-all text-center"
                >
                  Apply Now
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { Mail, Linkedin, Twitter } from 'lucide-react'
import { ObfuscatedEmail } from '@/components/frontend/ObfuscatedEmail'
import { TeamMemberAvatar } from '@/components/frontend/TeamMemberAvatar'

export type TeamMemberCard = {
  id: string
  name: string
  position: string
  department: string
  bio: string
  emailEncoded?: string
  photoUrl?: string | null
  linkedin?: string | null
  twitter?: string | null
}

export function TeamGrid({ members }: { members: TeamMemberCard[] }) {
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  const departments = useMemo(
    () => ['all', ...Array.from(new Set(members.map((m) => m.department)))],
    [members],
  )
  const filtered = useMemo(
    () => (selectedDepartment === 'all' ? members : members.filter((m) => m.department === selectedDepartment)),
    [selectedDepartment, members],
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
          >
            <TeamMemberAvatar name={member.name} photoUrl={member.photoUrl} />
            <div className="p-6">
              <h3 className="text-2xl text-[#1a1f71] mb-2">{member.name}</h3>
              <p className="text-lg text-[#2563eb] mb-1">{member.position}</p>
              <p className="text-sm text-gray-500 mb-4">{member.department}</p>
              <p className="text-gray-600 mb-6">{member.bio}</p>
              <div className="flex items-center gap-3">
                {member.emailEncoded && (
                  <ObfuscatedEmail
                    encoded={member.emailEncoded}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#2563eb] hover:text-white transition-colors flex items-center justify-center"
                    ariaLabel={`Email ${member.name}`}
                  >
                    <Mail className="w-5 h-5" />
                  </ObfuscatedEmail>
                )}
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#2563eb] hover:text-white transition-colors flex items-center justify-center"
                    aria-label={`LinkedIn profile of ${member.name}`}
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {member.twitter && (
                  <a
                    href={member.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#2563eb] hover:text-white transition-colors flex items-center justify-center"
                    aria-label={`Twitter profile of ${member.name}`}
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

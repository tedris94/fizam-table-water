import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Users, Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';

interface TeamViewProps {
  role: string;
}

export function TeamView({ role }: TeamViewProps) {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await fetch('/api/team-members?limit=500&sort=sortOrder')
      if (response.ok) {
        const data = await response.json()
        setTeam(data.docs ?? [])
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Team Management" role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl text-[#1a1f71] mb-2">Team Members</h2>
            <p className="text-gray-600">Manage your organization's team</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </div>

        {/* Team Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading team members...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl">
                    {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                  <h3 className="text-xl text-[#1a1f71] mb-1">{member.name}</h3>
                  <div className="text-sm text-[#2563eb] font-medium mb-2">{member.position}</div>
                  <div className="text-sm text-gray-600">{member.department}</div>
                </div>

                <div className="space-y-2 mb-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-[#2563eb] rounded-lg hover:bg-blue-100 transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

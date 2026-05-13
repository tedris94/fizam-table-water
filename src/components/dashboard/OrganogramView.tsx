'use client';

import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Users, ChevronDown, ChevronRight } from 'lucide-react';
import { useProfile } from '../../contexts/AuthContext';

interface OrgNode {
  id: string;
  name: string;
  position: string;
  department: string;
  reports_to?: string;
  email: string;
}

export function OrganogramView() {
  const profile = useProfile();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['ceo']));

  // Organizational structure
  const orgData: OrgNode[] = [
    { id: 'ceo', name: 'Chief Executive Officer', position: 'CEO', department: 'Executive', email: 'ceo@fizam.com' },
    
    // Operations
    { id: 'coo', name: 'Chief Operating Officer', position: 'COO', department: 'Operations', reports_to: 'ceo', email: 'coo@fizam.com' },
    { id: 'prod-mgr', name: 'Production Manager', position: 'Manager', department: 'Production', reports_to: 'coo', email: 'production@fizam.com' },
    { id: 'quality-mgr', name: 'Quality Control Manager', position: 'Manager', department: 'Quality', reports_to: 'coo', email: 'quality@fizam.com' },
    { id: 'logistics-mgr', name: 'Logistics Manager', position: 'Manager', department: 'Logistics', reports_to: 'coo', email: 'logistics@fizam.com' },
    
    // Sales & Marketing
    { id: 'cmo', name: 'Chief Marketing Officer', position: 'CMO', department: 'Marketing', reports_to: 'ceo', email: 'cmo@fizam.com' },
    { id: 'sales-mgr', name: 'Sales Manager', position: 'Manager', department: 'Sales', reports_to: 'cmo', email: 'sales@fizam.com' },
    { id: 'marketing-mgr', name: 'Marketing Manager', position: 'Manager', department: 'Marketing', reports_to: 'cmo', email: 'marketing@fizam.com' },
    
    // Finance
    { id: 'cfo', name: 'Chief Financial Officer', position: 'CFO', department: 'Finance', reports_to: 'ceo', email: 'cfo@fizam.com' },
    { id: 'accountant', name: 'Chief Accountant', position: 'Accountant', department: 'Finance', reports_to: 'cfo', email: 'accounting@fizam.com' },
    
    // HR
    { id: 'hr-dir', name: 'HR Director', position: 'Director', department: 'Human Resources', reports_to: 'ceo', email: 'hr@fizam.com' },
    { id: 'hr-mgr', name: 'HR Manager', position: 'Manager', department: 'Human Resources', reports_to: 'hr-dir', email: 'hr.manager@fizam.com' },
  ];

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getChildren = (parentId: string) => {
    return orgData.filter(node => node.reports_to === parentId);
  };

  const renderNode = (node: OrgNode, level: number = 0) => {
    const children = getChildren(node.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    const getDepartmentColor = (dept: string) => {
      const colors: Record<string, string> = {
        'Executive': 'from-purple-500 to-purple-600',
        'Operations': 'from-blue-500 to-blue-600',
        'Production': 'from-green-500 to-green-600',
        'Quality': 'from-cyan-500 to-cyan-600',
        'Logistics': 'from-indigo-500 to-indigo-600',
        'Marketing': 'from-pink-500 to-pink-600',
        'Sales': 'from-orange-500 to-orange-600',
        'Finance': 'from-emerald-500 to-emerald-600',
        'Human Resources': 'from-rose-500 to-rose-600'
      };
      return colors[dept] || 'from-gray-500 to-gray-600';
    };

    return (
      <div key={node.id} className={`${level > 0 ? 'ml-8 mt-4' : ''}`}>
        <div className="flex items-start gap-2">
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className="mt-6 flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5 mt-6 flex-shrink-0" />}
          
          <div className={`flex-1 bg-white rounded-xl shadow-lg p-6 ${level === 0 ? 'border-4 border-[#2563eb]' : 'border-2 border-gray-200'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getDepartmentColor(node.department)} flex items-center justify-center flex-shrink-0`}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-[#1a1f71] mb-1">{node.name}</h3>
                <p className="text-[#2563eb] mb-1">{node.position}</p>
                <p className="text-sm text-gray-600 mb-2">{node.department}</p>
                <p className="text-xs text-gray-500">{node.email}</p>
              </div>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-2">
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = orgData.filter(node => !node.reports_to);

  return (
    <DashboardLayout title="Company Organogram" role={profile?.role || 'user'}>
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-[#1a1f71] to-[#2563eb] rounded-2xl p-8 text-white mb-6">
          <h2 className="text-2xl mb-2">Organizational Structure</h2>
          <p className="text-blue-200">Fizam Table Water Company Hierarchy</p>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg text-[#1a1f71] mb-4">Department Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Executive', color: 'from-purple-500 to-purple-600' },
              { name: 'Operations', color: 'from-blue-500 to-blue-600' },
              { name: 'Sales/Marketing', color: 'from-pink-500 to-pink-600' },
              { name: 'Finance', color: 'from-emerald-500 to-emerald-600' },
              { name: 'Human Resources', color: 'from-rose-500 to-rose-600' }
            ].map((dept, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded bg-gradient-to-br ${dept.color}`}></div>
                <span className="text-sm text-gray-700">{dept.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Organogram Tree */}
        <div className="bg-gray-50 rounded-2xl p-6">
          {rootNodes.map(node => renderNode(node))}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Click the arrow icons to expand or collapse departments and view reporting structures.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

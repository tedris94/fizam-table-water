import { DashboardLayout } from './DashboardLayout';
import { FileText, Image, Search, Layout, Eye, Edit } from 'lucide-react';
import Link from 'next/link';

interface CMSViewProps {
  role: string;
}

export function CMSView({ role }: CMSViewProps) {
  const stats = [
    { title: 'Total Pages', value: '12', icon: FileText, color: 'from-blue-500 to-blue-600' },
    { title: 'Media Files', value: '148', icon: Image, color: 'from-purple-500 to-purple-600' },
    { title: 'SEO Score', value: '87%', icon: Search, color: 'from-green-500 to-green-600' },
    { title: 'Published', value: '10', icon: Layout, color: 'from-orange-500 to-orange-600' },
  ];

  const quickActions = [
    { title: 'Manage Pages', href: '/dashboard/cms/pages', icon: FileText, description: 'Edit website pages and content', color: 'from-blue-50 to-blue-100', iconColor: 'text-blue-600' },
    { title: 'Media Library', href: '/dashboard/cms/media', icon: Image, description: 'Upload and manage images', color: 'from-purple-50 to-purple-100', iconColor: 'text-purple-600' },
    { title: 'SEO Settings', href: '/dashboard/cms/seo', icon: Search, description: 'Optimize search engine visibility', color: 'from-green-50 to-green-100', iconColor: 'text-green-600' },
  ];

  const recentPages = [
    { title: 'Home Page', status: 'published', lastEdited: '2 hours ago', views: 1243 },
    { title: 'About Us', status: 'published', lastEdited: '1 day ago', views: 892 },
    { title: 'Products', status: 'published', lastEdited: '2 days ago', views: 1567 },
    { title: 'Contact', status: 'draft', lastEdited: '3 days ago', views: 654 },
  ];

  return (
    <DashboardLayout title="CMS Management" role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl text-[#1a1f71] mb-2">Content Management System</h2>
          <p className="text-gray-600">Manage your website content, media, and SEO settings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl text-[#1a1f71]">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={`bg-gradient-to-br ${action.color} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-xl text-[#1a1f71] mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Pages */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl text-[#1a1f71] mb-4 flex items-center justify-between">
            <span>Recent Pages</span>
            <Link href="/dashboard/cms/pages" className="text-sm text-[#2563eb] hover:underline">
              View All
            </Link>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm font-medium">Page</th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm font-medium">Last Edited</th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm font-medium">Views</th>
                  <th className="text-right py-3 px-4 text-gray-600 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPages.map((page, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-[#1a1f71]">{page.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        page.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{page.lastEdited}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{page.views.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button className="p-2 text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

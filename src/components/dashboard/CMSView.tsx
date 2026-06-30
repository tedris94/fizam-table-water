'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { FileText, Image as ImageIcon, Search, Layout, Eye, Edit, PanelTop, PanelBottom, Home } from 'lucide-react';
import Link from 'next/link';

interface CMSViewProps {
  role: string;
}

type RecentPage = {
  id: number | string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  views: number;
};

type CmsStats = {
  totalPages: number;
  publishedPages: number;
  mediaCount: number;
  seoScore: number;
  homeViews: number;
  recentPages: RecentPage[];
};

export function CMSView({ role }: CMSViewProps) {
  const [stats, setStats] = useState<CmsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/dashboard/cms/stats', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load CMS stats');
        const data = (await res.json()) as CmsStats;
        if (active) setStats(data);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const statCards = [
    { title: 'Total Pages', value: stats?.totalPages ?? 0, icon: FileText, color: 'from-blue-500 to-blue-600' },
    { title: 'Media Files', value: stats?.mediaCount ?? 0, icon: ImageIcon, color: 'from-purple-500 to-purple-600' },
    { title: 'SEO Score', value: `${stats?.seoScore ?? 0}%`, icon: Search, color: 'from-green-500 to-green-600' },
    { title: 'Published', value: stats?.publishedPages ?? 0, icon: Layout, color: 'from-orange-500 to-orange-600' },
  ];

  const quickActions = [
    { title: 'Manage Pages', href: '/dashboard/cms/pages', icon: FileText, description: 'Create, edit and publish pages', color: 'from-blue-50 to-blue-100', iconColor: 'text-blue-600' },
    { title: 'Media Library', href: '/dashboard/cms/media', icon: ImageIcon, description: 'Upload and manage images', color: 'from-purple-50 to-purple-100', iconColor: 'text-purple-600' },
    { title: 'SEO Settings', href: '/dashboard/cms/seo', icon: Search, description: 'Optimize search engine visibility', color: 'from-green-50 to-green-100', iconColor: 'text-green-600' },
    { title: 'Header', href: '/dashboard/cms/header', icon: PanelTop, description: 'Manage site navigation', color: 'from-amber-50 to-amber-100', iconColor: 'text-amber-600' },
    { title: 'Footer', href: '/dashboard/cms/footer', icon: PanelBottom, description: 'Manage footer links & contact', color: 'from-sky-50 to-sky-100', iconColor: 'text-sky-600' },
    { title: 'Home Layout', href: '/admin/globals/home-page', icon: Home, description: 'Edit the home page sections', color: 'from-rose-50 to-rose-100', iconColor: 'text-rose-600', external: true },
  ];

  return (
    <DashboardLayout title="CMS Management" role={role}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl text-[#1a1f71] mb-2">Content Management System</h2>
          <p className="text-gray-600">Manage your website content, media, and SEO settings</p>
        </div>

        {error && (
          <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl text-[#1a1f71]">{loading ? '—' : stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) =>
            action.external ? (
              <a
                key={index}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-gradient-to-br ${action.color} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105`}
              >
                <QuickActionInner action={action} />
              </a>
            ) : (
              <Link
                key={index}
                href={action.href}
                className={`bg-gradient-to-br ${action.color} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105`}
              >
                <QuickActionInner action={action} />
              </Link>
            ),
          )}
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
                  <th className="text-left py-3 px-4 text-gray-600 text-sm font-medium">Views (30d)</th>
                  <th className="text-right py-3 px-4 text-gray-600 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-6 px-4 text-center text-gray-400">Loading…</td>
                  </tr>
                )}
                {!loading && (stats?.recentPages.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 px-4 text-center text-gray-400">
                      No pages yet. Create one from Manage Pages.
                    </td>
                  </tr>
                )}
                {stats?.recentPages.map((page) => (
                  <tr key={page.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-[#1a1f71]">{page.title}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {page.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{new Date(page.updatedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{page.views.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors"
                          aria-label={`View ${page.title}`}
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a
                          href={`/admin/collections/pages/${page.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label={`Edit ${page.title}`}
                        >
                          <Edit className="w-4 h-4" />
                        </a>
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

function QuickActionInner({ action }: { action: { title: string; description: string; icon: typeof FileText; iconColor: string } }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
        <action.icon className={`w-6 h-6 ${action.iconColor}`} />
      </div>
      <div>
        <h3 className="text-xl text-[#1a1f71] mb-2">{action.title}</h3>
        <p className="text-gray-600 text-sm">{action.description}</p>
      </div>
    </div>
  );
}

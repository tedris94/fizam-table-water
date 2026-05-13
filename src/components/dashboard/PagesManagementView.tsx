import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';

interface PagesManagementViewProps {
  role: string;
}

export function PagesManagementView({ role }: PagesManagementViewProps) {
  const [editingPage, setEditingPage] = useState<any>(null);
  
  const [pages, setPages] = useState([
    {
      id: 1,
      title: 'Home Page',
      slug: 'home',
      status: 'published',
      content: '<h1>Welcome to Fizam Table Water</h1><p>Premium quality water for your daily needs.</p>',
      metaTitle: 'Fizam Table Water - Quality Water Production',
      metaDescription: 'Premium table water, sachet water, and dispensable water in Nigeria',
      lastEdited: '2024-02-03',
    },
    {
      id: 2,
      title: 'About Us',
      slug: 'about',
      status: 'published',
      content: '<h1>About Fizam</h1><p>We are committed to providing clean, safe drinking water.</p>',
      metaTitle: 'About Fizam Table Water',
      metaDescription: 'Learn about our commitment to quality water production',
      lastEdited: '2024-02-02',
    },
    {
      id: 3,
      title: 'Products',
      slug: 'products',
      status: 'published',
      content: '<h1>Our Products</h1><p>Explore our range of water products.</p>',
      metaTitle: 'Fizam Products - Water Solutions',
      metaDescription: 'Browse our complete range of table water and sachet water products',
      lastEdited: '2024-02-01',
    },
    {
      id: 4,
      title: 'Privacy Policy',
      slug: 'privacy',
      status: 'published',
      content: '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>',
      metaTitle: 'Privacy Policy - Fizam',
      metaDescription: 'Read our privacy policy and data protection practices',
      lastEdited: '2024-01-30',
    },
  ]);

  const handleEdit = (page: any) => {
    setEditingPage({ ...page });
  };

  const handleSave = () => {
    if (editingPage) {
      setPages(pages.map(p => p.id === editingPage.id ? editingPage : p));
      setEditingPage(null);
    }
  };

  const handleCancel = () => {
    setEditingPage(null);
  };

  const toggleStatus = (id: number) => {
    setPages(pages.map(p => 
      p.id === id 
        ? { ...p, status: p.status === 'published' ? 'draft' : 'published' }
        : p
    ));
  };

  return (
    <DashboardLayout title="Pages Management" role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl text-[#1a1f71] mb-2">Website Pages</h2>
            <p className="text-gray-600">Manage and edit your website pages</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-5 h-5" />
            New Page
          </button>
        </div>

        {/* Editor Modal */}
        {editingPage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
                <h3 className="text-2xl text-[#1a1f71]">Edit Page</h3>
                <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Page Title</label>
                    <input
                      type="text"
                      value={editingPage.title}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">URL Slug</label>
                    <input
                      type="text"
                      value={editingPage.slug}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Page Content</label>
                  <textarea
                    value={editingPage.content}
                    onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">HTML content supported</p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg text-[#1a1f71] mb-4">SEO Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Meta Title</label>
                      <input
                        type="text"
                        value={editingPage.metaTitle}
                        onChange={(e) => setEditingPage({ ...editingPage, metaTitle: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">{editingPage.metaTitle.length}/60 characters</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Meta Description</label>
                      <textarea
                        value={editingPage.metaDescription}
                        onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">{editingPage.metaDescription.length}/160 characters</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 flex gap-4 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pages List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Page Title</th>
                  <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">URL Slug</th>
                  <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Last Edited</th>
                  <th className="text-right py-4 px-6 text-gray-600 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-[#1a1f71] font-medium">{page.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">/{page.slug}</code>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleStatus(page.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          page.status === 'published'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        {page.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {page.status}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">
                      {new Date(page.lastEdited).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(page)}
                          className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-[#2563eb] rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
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

'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Save, X, ExternalLink, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PagesManagementViewProps {
  role: string;
}

type Page = {
  id: number | string;
  title: string;
  slug: string;
  status: string;
  metaTitle: string;
  metaDescription: string;
  sections: number;
  updatedAt: string;
};

type EditState = {
  id?: number | string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
};

const EMPTY_EDIT: EditState = { title: '', slug: '', metaTitle: '', metaDescription: '' };

export function PagesManagementView({ role }: PagesManagementViewProps) {
  const { hasCap } = useAuth();
  const canCreate = hasCap('cms.pages.create');
  const canEdit = hasCap('cms.pages.edit');
  const canDelete = hasCap('cms.pages.delete');
  const canPublish = hasCap('cms.pages.publish');

  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'new' | 'edit' | null>(null);
  const [form, setForm] = useState<EditState>(EMPTY_EDIT);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pages', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load pages');
      const data = (await res.json()) as { docs: Page[] };
      setPages(data.docs);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openNew = () => {
    setForm(EMPTY_EDIT);
    setMode('new');
  };

  const openEdit = (page: Page) => {
    setForm({
      id: page.id,
      title: page.title,
      slug: page.slug,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
    });
    setMode('edit');
  };

  const closeModal = () => {
    setMode(null);
    setForm(EMPTY_EDIT);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (mode === 'new') {
        const res = await fetch('/api/admin/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: form.title,
            slug: form.slug,
            metaTitle: form.metaTitle,
            metaDescription: form.metaDescription,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to create page');
        // Keep the user in the dashboard and switch to edit mode for the new
        // page so the "Build layout" action is immediately available.
        const created = (data.doc ?? {}) as { id?: number | string; title?: string; slug?: string };
        await load();
        if (created.id != null) {
          setForm({
            id: created.id,
            title: created.title ?? form.title,
            slug: created.slug ?? form.slug,
            metaTitle: form.metaTitle,
            metaDescription: form.metaDescription,
          });
          setMode('edit');
        } else {
          closeModal();
        }
        return;
      } else if (mode === 'edit' && form.id != null) {
        const res = await fetch(`/api/admin/pages/${form.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: form.title,
            slug: form.slug,
            metaTitle: form.metaTitle,
            metaDescription: form.metaDescription,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to update page');
      }
      closeModal();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (page: Page) => {
    const next = page.status === 'published' ? 'draft' : 'published';
    setError('');
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to change status');
      setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, status: next } : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
  };

  const handleDelete = async (page: Page) => {
    if (!window.confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete page');
      setPages((prev) => prev.filter((p) => p.id !== page.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
  };

  return (
    <DashboardLayout title="Pages Management" role={role}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl text-[#1a1f71] mb-2">Website Pages</h2>
            <p className="text-gray-600">Create pages, then build their layout in the editor.</p>
          </div>
          {canCreate && (
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              New Page
            </button>
          )}
        </div>

        {error && <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-red-700">{error}</div>}

        {/* Editor Modal */}
        {mode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
                <h3 className="text-2xl text-[#1a1f71]">{mode === 'new' ? 'New Page' : 'Edit Page'}</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Page Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">URL Slug</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder={mode === 'new' ? 'auto from title' : ''}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg text-[#1a1f71] mb-4">SEO Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Meta Title</label>
                      <input
                        type="text"
                        value={form.metaTitle}
                        onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">{form.metaTitle.length}/60 characters</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Meta Description</label>
                      <textarea
                        value={form.metaDescription}
                        onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">{form.metaDescription.length}/160 characters</p>
                    </div>
                  </div>
                </div>

                {mode === 'edit' && form.id != null && (
                  <div className="rounded-xl bg-blue-50 p-4 flex items-center justify-between gap-4">
                    <div className="text-sm text-blue-900">
                      Build this page&apos;s sections (hero, products, rich text…) in the layout editor.
                    </div>
                    <a
                      href={`/admin/collections/pages/${form.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white text-[#2563eb] rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors whitespace-nowrap"
                    >
                      <Layers className="w-4 h-4" />
                      Build layout
                    </a>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 flex gap-4 justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-60"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving…' : mode === 'new' ? 'Create Page' : 'Save Changes'}
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
                  <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Sections</th>
                  <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Last Edited</th>
                  <th className="text-right py-4 px-6 text-gray-600 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-8 px-6 text-center text-gray-400">Loading…</td>
                  </tr>
                )}
                {!loading && pages.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 px-6 text-center text-gray-400">No pages yet.</td>
                  </tr>
                )}
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
                    <td className="py-4 px-6 text-gray-600 text-sm">{page.sections}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => canPublish && toggleStatus(page)}
                        disabled={!canPublish}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          page.status === 'published'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        } ${canPublish ? '' : 'cursor-default opacity-80'}`}
                        title={canPublish ? 'Toggle publish status' : 'You cannot change publish status'}
                      >
                        {page.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {page.status}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">{new Date(page.updatedAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors"
                          aria-label="View page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <a
                          href={`/admin/collections/pages/${page.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label="Build layout"
                        >
                          <Layers className="w-4 h-4" />
                        </a>
                        {canEdit && (
                          <button
                            onClick={() => openEdit(page)}
                            className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-[#2563eb] rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(page)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Delete page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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

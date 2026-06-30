'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Globe, FileText, TrendingUp, Save, AlertCircle } from 'lucide-react';

interface SEOSettingsViewProps {
  role: string;
}

type SeoSettings = {
  siteName: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultKeywords: string;
  googleSiteVerification: string;
};

const EMPTY: SeoSettings = {
  siteName: '',
  defaultMetaTitle: '',
  defaultMetaDescription: '',
  defaultKeywords: '',
  googleSiteVerification: '',
};

function computeScore(s: SeoSettings): { score: number; issues: { type: 'warning' | 'info'; message: string }[] } {
  const issues: { type: 'warning' | 'info'; message: string }[] = [];
  let points = 0;
  const total = 5;

  if (s.siteName.trim()) points += 1;
  else issues.push({ type: 'warning', message: 'Site name is empty.' });

  if (s.defaultMetaTitle.trim()) {
    points += 1;
    if (s.defaultMetaTitle.length > 60)
      issues.push({ type: 'info', message: `Meta title is ${s.defaultMetaTitle.length} chars (ideal ≤ 60).` });
  } else issues.push({ type: 'warning', message: 'Default meta title is missing.' });

  if (s.defaultMetaDescription.trim()) {
    points += 1;
    if (s.defaultMetaDescription.length < 120 || s.defaultMetaDescription.length > 160)
      issues.push({
        type: 'info',
        message: `Meta description is ${s.defaultMetaDescription.length} chars (ideal 150–160).`,
      });
  } else issues.push({ type: 'warning', message: 'Default meta description is missing.' });

  if (s.defaultKeywords.trim()) points += 1;
  else issues.push({ type: 'info', message: 'No SEO keywords configured.' });

  if (s.googleSiteVerification.trim()) points += 1;
  else issues.push({ type: 'info', message: 'Google Search Console verification not set.' });

  return { score: Math.round((points / total) * 100), issues };
}

export function SEOSettingsView({ role }: SEOSettingsViewProps) {
  const [settings, setSettings] = useState<SeoSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/seo', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load SEO settings');
        const data = (await res.json()) as SeoSettings;
        if (active) setSettings({ ...EMPTY, ...data });
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

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const { score, issues } = computeScore(settings);

  return (
    <DashboardLayout title="SEO Settings" role={role}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl text-[#1a1f71] mb-2">SEO Settings</h2>
          <p className="text-gray-600">Optimize your website for search engines</p>
        </div>

        {error && <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-red-700">{error}</div>}

        {/* SEO Score Card */}
        <div className="bg-gradient-to-br from-[#1a1f71] to-[#2563eb] rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl mb-2">Overall SEO Score</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-bold">{loading ? '—' : score}</span>
                <span className="text-2xl opacity-80 mb-2">/100</span>
              </div>
              <div className="flex items-center gap-2 text-green-300">
                <TrendingUp className="w-5 h-5" />
                <span>{score >= 80 ? 'Good performance' : score >= 50 ? 'Needs improvement' : 'Action required'}</span>
              </div>
            </div>
            <div className="w-32 h-32 rounded-full border-8 border-white/30 flex items-center justify-center">
              <div className="text-4xl font-bold">{loading ? '—' : `${score}%`}</div>
            </div>
          </div>
        </div>

        {/* SEO Issues */}
        {!loading && issues.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl text-[#1a1f71] mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Recommendations
            </h3>
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-l-4 ${
                    issue.type === 'warning' ? 'bg-yellow-50 border-yellow-500' : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <p className={issue.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'}>{issue.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General SEO Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#2563eb]" />
            </div>
            <h3 className="text-xl text-[#1a1f71]">General Settings</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Default Meta Title</label>
              <input
                type="text"
                value={settings.defaultMetaTitle}
                onChange={(e) => setSettings({ ...settings, defaultMetaTitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">{settings.defaultMetaTitle.length}/60 characters</p>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Default Meta Description</label>
              <textarea
                value={settings.defaultMetaDescription}
                onChange={(e) => setSettings({ ...settings, defaultMetaDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">{settings.defaultMetaDescription.length}/160 characters</p>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Keywords (comma separated)</label>
              <input
                type="text"
                value={settings.defaultKeywords}
                onChange={(e) => setSettings({ ...settings, defaultKeywords: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Search Console */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl text-[#1a1f71]">Search Console</h3>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Google Site Verification</label>
            <input
              type="text"
              value={settings.googleSiteVerification}
              onChange={(e) => setSettings({ ...settings, googleSiteVerification: e.target.value })}
              placeholder="Verification content value"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">The content value of the Search Console verification meta tag.</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          {saved && <span className="text-green-600 text-sm">Saved!</span>}
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-60"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving…' : 'Save SEO Settings'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

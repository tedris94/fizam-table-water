import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Search, Globe, Link, FileText, TrendingUp, Save, AlertCircle } from 'lucide-react';

interface SEOSettingsViewProps {
  role: string;
}

export function SEOSettingsView({ role }: SEOSettingsViewProps) {
  const [settings, setSettings] = useState({
    siteTitle: 'Fizam Table Water - Quality Water Production',
    siteDescription: 'Premium table water, sachet water, and dispensable water in Nigeria. Quality certified water production company.',
    siteKeywords: 'table water, sachet water, pure water, drinking water, water production, Nigeria',
    googleAnalytics: 'G-XXXXXXXXXX',
    googleSearchConsole: '',
    facebookPixel: '',
    robotsTxt: 'User-agent: *\nDisallow: /admin\nSitemap: https://fizam.ng/sitemap.xml',
    canonicalUrl: 'https://fizam.ng',
    ogImage: '/images/og-image.jpg',
  });

  const handleSave = () => {
    console.log('Saving SEO settings:', settings);
    // Save to backend
  };

  const seoScore = 87;
  const issues = [
    { type: 'warning', message: 'Meta description is slightly short (120 chars). Recommended: 150-160 chars.' },
    { type: 'info', message: 'Consider adding structured data for better search results.' },
  ];

  return (
    <DashboardLayout title="SEO Settings" role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl text-[#1a1f71] mb-2">SEO Settings</h2>
          <p className="text-gray-600">Optimize your website for search engines</p>
        </div>

        {/* SEO Score Card */}
        <div className="bg-gradient-to-br from-[#1a1f71] to-[#2563eb] rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl mb-2">Overall SEO Score</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-bold">{seoScore}</span>
                <span className="text-2xl opacity-80 mb-2">/100</span>
              </div>
              <div className="flex items-center gap-2 text-green-300">
                <TrendingUp className="w-5 h-5" />
                <span>Good performance</span>
              </div>
            </div>
            <div className="w-32 h-32 rounded-full border-8 border-white/30 flex items-center justify-center">
              <div className="text-4xl font-bold">{seoScore}%</div>
            </div>
          </div>
        </div>

        {/* SEO Issues */}
        {issues.length > 0 && (
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
                    issue.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <p className={issue.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'}>
                    {issue.message}
                  </p>
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
              <label className="block text-sm text-gray-700 mb-2">Site Title</label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">{settings.siteTitle.length}/60 characters</p>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Site Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">{settings.siteDescription.length}/160 characters</p>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Keywords (comma separated)</label>
              <input
                type="text"
                value={settings.siteKeywords}
                onChange={(e) => setSettings({ ...settings, siteKeywords: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Canonical URL</label>
              <input
                type="url"
                value={settings.canonicalUrl}
                onChange={(e) => setSettings({ ...settings, canonicalUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Analytics & Tracking */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl text-[#1a1f71]">Analytics & Tracking</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Google Analytics ID</label>
              <input
                type="text"
                value={settings.googleAnalytics}
                onChange={(e) => setSettings({ ...settings, googleAnalytics: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Google Search Console</label>
              <input
                type="text"
                value={settings.googleSearchConsole}
                onChange={(e) => setSettings({ ...settings, googleSearchConsole: e.target.value })}
                placeholder="Verification code"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Facebook Pixel ID</label>
              <input
                type="text"
                value={settings.facebookPixel}
                onChange={(e) => setSettings({ ...settings, facebookPixel: e.target.value })}
                placeholder="123456789"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Link className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl text-[#1a1f71]">Social Media (Open Graph)</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">OG Image URL</label>
              <input
                type="text"
                value={settings.ogImage}
                onChange={(e) => setSettings({ ...settings, ogImage: e.target.value })}
                placeholder="/images/og-image.jpg"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630 pixels</p>
            </div>
          </div>
        </div>

        {/* Robots.txt */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-xl text-[#1a1f71]">Robots.txt</h3>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Robots.txt Content</label>
            <textarea
              value={settings.robotsTxt}
              onChange={(e) => setSettings({ ...settings, robotsTxt: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors font-mono text-sm"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Save className="w-5 h-5" />
            Save SEO Settings
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

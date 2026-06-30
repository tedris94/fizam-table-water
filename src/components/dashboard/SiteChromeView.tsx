'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { ExternalLink, PanelTop, PanelBottom, Link2 } from 'lucide-react';

interface SiteChromeViewProps {
  role: string;
  kind: 'header' | 'footer';
}

type HeaderDoc = {
  brandName?: string;
  navLinks?: { label: string; href: string }[];
  ctaLabel?: string;
  ctaHref?: string;
  showLogin?: boolean;
};

type FooterDoc = {
  about?: string;
  columns?: { title: string; links?: { label: string; href: string }[] }[];
  contact?: { email?: string; address?: string };
  legalLinks?: { label: string; href: string }[];
};

export function SiteChromeView({ role, kind }: SiteChromeViewProps) {
  const slug = kind === 'header' ? 'header' : 'footer';
  const title = kind === 'header' ? 'Site Header' : 'Site Footer';
  const Icon = kind === 'header' ? PanelTop : PanelBottom;

  const [data, setData] = useState<HeaderDoc & FooterDoc>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/globals/${slug}?depth=0`, { credentials: 'include' });
        if (res.ok && active) setData(await res.json());
      } catch {
        /* ignore — show empty summary */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <DashboardLayout title={title} role={role}>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl text-[#1a1f71] mb-2">{title}</h2>
            <p className="text-gray-600">
              {kind === 'header'
                ? 'Manage the navigation links, brand, and call-to-action shown across the site.'
                : 'Manage footer columns, contact details, social and legal links shown across the site.'}
            </p>
          </div>
          <a
            href={`/admin/globals/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all whitespace-nowrap"
          >
            <ExternalLink className="w-5 h-5" />
            Edit in editor
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-[#2563eb]" />
            </div>
            <h3 className="text-xl text-[#1a1f71]">Current configuration</h3>
          </div>

          {loading ? (
            <p className="text-gray-400">Loading…</p>
          ) : kind === 'header' ? (
            <div className="space-y-4 text-sm">
              <Row label="Brand name" value={data.brandName || '— (default)'} />
              <Row label="CTA button" value={data.ctaLabel ? `${data.ctaLabel} → ${data.ctaHref || ''}` : '— (default)'} />
              <Row label="Login link" value={data.showLogin === false ? 'Hidden' : 'Shown'} />
              <div>
                <div className="text-gray-500 mb-2">Navigation links</div>
                {data.navLinks && data.navLinks.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {data.navLinks.map((l, i) => (
                      <li key={i} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                        <Link2 className="w-3 h-3" /> {l.label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">Using default navigation.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <Row label="About blurb" value={data.about ? `${data.about.slice(0, 80)}…` : '— (default)'} />
              <Row label="Contact email" value={data.contact?.email || '— (default)'} />
              <div>
                <div className="text-gray-500 mb-2">Link columns</div>
                {data.columns && data.columns.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {data.columns.map((c, i) => (
                      <li key={i} className="bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                        {c.title} ({c.links?.length ?? 0})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">Using default footer.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
          Changes here apply site-wide. The full editor lets you add, reorder and remove links and content.
        </div>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <div className="w-40 shrink-0 text-gray-500">{label}</div>
      <div className="text-[#1a1f71]">{value}</div>
    </div>
  );
}

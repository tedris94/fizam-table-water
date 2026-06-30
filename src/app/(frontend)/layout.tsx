import type { Metadata, Viewport } from 'next'
import '../globals.css'
import { Suspense } from 'react'
import { SiteChrome } from '@/components/site/SiteChrome'
import { PWARegister } from '@/components/PWARegister'
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker'
import { SiteJsonLd } from '@/components/seo/SiteJsonLd'
import { inter } from '@/lib/fonts'
import { buildPageMetadata, DEFAULT_OG_IMAGE } from '@/lib/seo'
import { getSiteSeoSettings } from '@/lib/site-settings-seo'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSeoSettings()
  const meta = buildPageMetadata({
    title: settings.defaultMetaTitle,
    description: settings.defaultMetaDescription,
    path: '/',
    keywords: settings.defaultKeywords,
    image: DEFAULT_OG_IMAGE,
  })

  if (settings.googleSiteVerification) {
    meta.verification = {
      google: settings.googleSiteVerification,
    }
  }

  return {
    ...meta,
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      title: 'Fizam Water',
      statusBarStyle: 'black-translucent',
    },
    applicationName: settings.siteName,
    category: 'business',
  }
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
}

/** Marketing site document shell (see root `layout.tsx` — Payload admin uses its own document). */
export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <SiteJsonLd />
        <SiteChrome>{children}</SiteChrome>
        <PWARegister />
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
      </body>
    </html>
  )
}

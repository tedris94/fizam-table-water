import type { Metadata, Viewport } from 'next'
import '../globals.css'
import { SiteChrome } from '@/components/site/SiteChrome'
import { PWARegister } from '@/components/PWARegister'
import { inter } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'Fizam Table Water',
  description: 'Pure hydration for every Nigerian home.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Fizam Water',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
}

/** Marketing site document shell (see root `layout.tsx` — Payload admin uses its own document). */
export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <SiteChrome>{children}</SiteChrome>
        <PWARegister />
      </body>
    </html>
  )
}

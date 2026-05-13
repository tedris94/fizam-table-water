import type { Metadata, Viewport } from 'next'
import '../globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { PWARegister } from '@/components/PWARegister'
import { inter } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'Fizam Dashboard',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
}

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        <PWARegister />
      </body>
    </html>
  )
}

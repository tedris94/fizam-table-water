'use client'

import { AuthProvider } from '@/contexts/AuthContext'

/**
 * Wraps the public site in client-side providers only.
 * Pages render their own `<Navbar>` / `<SimpleNavbar>` / `<Footer>` to mirror the
 * Figma layout exactly (each page picks the chrome it needs).
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

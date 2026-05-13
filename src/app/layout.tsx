import type { ReactNode } from 'react'

/**
 * Shell layout: real `<html>/<body>` come from nested layouts.
 * - `(frontend)` + `(dashboard)` add marketing/dashboard chrome.
 * - `(payload)` uses Payload `RootLayout` which renders the document for `/admin` + API routes.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}

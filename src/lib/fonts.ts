import { Inter } from 'next/font/google'

/**
 * App-wide sans font (matches the Figma reference at
 * https://panic-shred-66166669.figma.site/, which uses Inter).
 *
 * Exposed via the CSS variable `--font-inter` so Tailwind v4's
 * `--font-sans` token in `globals.css` can point at it.
 */
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

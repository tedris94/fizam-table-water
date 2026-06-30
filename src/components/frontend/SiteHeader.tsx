'use client'

import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/frontend/Logo'
import { useAuth } from '@/contexts/AuthContext'

export type NavLink = { label: string; href: string }

export type SiteHeaderProps = {
  variant?: 'transparent' | 'solid'
  brandName?: string | null
  navLinks?: NavLink[] | null
  ctaLabel?: string | null
  ctaHref?: string | null
  showLogin?: boolean | null
}

const DEFAULT_NAV: NavLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Products', href: '#products' },
  { label: 'Quality', href: '#quality' },
  { label: 'Sales Channels', href: '#sales' },
  { label: 'Team', href: '/team' },
  { label: 'Careers', href: '/careers' },
]

export function SiteHeader({
  variant = 'solid',
  brandName = 'FIZAM Table Water',
  navLinks,
  ctaLabel = 'Order Now',
  ctaHref = '/order',
  showLogin = true,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, loading } = useAuth()
  const isLoggedIn = Boolean(user)
  const links = navLinks && navLinks.length > 0 ? navLinks : DEFAULT_NAV
  const transparent = variant === 'transparent'

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) {
      setMobileMenuOpen(false)
      return
    }
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault()
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileMenuOpen(false)
    } else {
      e.preventDefault()
      window.location.href = `/${href}`
    }
  }

  const linkClass = 'hover:text-blue-200 transition-colors'

  const authLink = showLogin
    ? !loading && isLoggedIn
      ? { label: 'Dashboard', href: '/dashboard' }
      : { label: 'Login', href: '/login' }
    : null

  const navInner = (
    <div className="flex items-center justify-between">
      <a href="/" className="flex items-center gap-3" aria-label="Fizam Table Water — Home">
        <Logo variant="light" className={transparent ? 'h-12 md:h-16 w-auto' : 'h-11 md:h-14 w-auto'} priority />
        {brandName && <span className="text-xl md:text-2xl font-medium tracking-tight">{brandName}</span>}
      </a>

      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className={linkClass}>
            {link.label}
          </a>
        ))}
        {ctaLabel && ctaHref && (
          <a href={ctaHref} className="bg-white text-[#1a1f71] px-6 py-2 rounded-full hover:bg-blue-50 transition-colors">
            {ctaLabel}
          </a>
        )}
        {authLink && (
          <a href={authLink.href} className={linkClass}>
            {authLink.label}
          </a>
        )}
      </div>

      <button onClick={() => setMobileMenuOpen((v) => !v)} className="md:hidden p-2" aria-label="Toggle menu">
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </div>
  )

  const mobileMenu = mobileMenuOpen && (
    <div className="md:hidden mt-4 pb-4 space-y-4">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={(e) => handleNavClick(e, link.href)}
          className={`block ${linkClass}`}
        >
          {link.label}
        </a>
      ))}
      {ctaLabel && ctaHref && (
        <a
          href={ctaHref}
          className="block bg-white text-[#1a1f71] px-6 py-2 rounded-full hover:bg-blue-50 transition-colors text-center"
          onClick={() => setMobileMenuOpen(false)}
        >
          {ctaLabel}
        </a>
      )}
      {authLink && (
        <a href={authLink.href} className={`block ${linkClass}`} onClick={() => setMobileMenuOpen(false)}>
          {authLink.label}
        </a>
      )}
    </div>
  )

  if (transparent) {
    return (
      <nav className="relative z-10 container mx-auto px-4 py-6 text-white">
        {navInner}
        {mobileMenu}
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        {navInner}
        {mobileMenu}
      </div>
    </nav>
  )
}

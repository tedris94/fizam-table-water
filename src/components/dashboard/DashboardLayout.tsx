'use client'

import { ReactNode, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  TrendingUp,
  Layout as LayoutIcon,
  MapPin,
  Activity,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/frontend/Logo'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  role: string
}

export function DashboardLayout({ children, title, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  /** Only mount the dimmed scrim on small viewports — avoids relying on `lg:hidden` alone (can miss in some Tailwind builds). */
  const isMobileNav = useMediaQuery('(max-width: 1023px)')

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  // Close mobile drawer on navigation (new page = new layout instance may still inherit stale UI in edge cases).
  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  // Desktop: never leave the dimmed overlay / drawer state from a narrow window.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => {
      if (mq.matches) closeSidebar()
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [closeSidebar])

  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sidebarOpen, closeSidebar])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
      roles: ['super_admin', 'admin', 'hr', 'user', 'customer'],
    },
    {
      icon: TrendingUp,
      label: 'Analytics',
      path: '/dashboard/analytics',
      roles: ['super_admin', 'admin'],
    },
    {
      icon: Package,
      label: 'Products',
      path: '/dashboard/products',
      roles: ['super_admin', 'admin'],
    },
    {
      icon: ShoppingCart,
      label: 'Orders',
      path: '/dashboard/orders',
      roles: ['super_admin', 'admin'],
    },
    {
      icon: MapPin,
      label: 'Delivery locations',
      path: '/dashboard/shipping-zones',
      roles: ['super_admin', 'admin'],
    },
    {
      icon: Users,
      label: 'Team',
      path: '/dashboard/team',
      roles: ['super_admin', 'admin', 'hr'],
    },
    {
      icon: Briefcase,
      label: 'Careers',
      path: '/dashboard/careers',
      roles: ['super_admin', 'hr'],
    },
    {
      icon: FileText,
      label: 'Applications',
      path: '/dashboard/applications',
      roles: ['super_admin', 'hr'],
    },
    {
      icon: Users,
      label: 'Organogram',
      path: '/dashboard/organogram',
      roles: ['super_admin', 'admin', 'hr'],
    },
    {
      icon: LayoutIcon,
      label: 'CMS',
      path: '/dashboard/cms',
      roles: ['super_admin', 'admin'],
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/dashboard/settings',
      roles: ['super_admin', 'admin', 'hr', 'user', 'customer'],
    },
    {
      icon: Activity,
      label: 'Diagnostics',
      path: '/dashboard/diagnostics',
      roles: ['super_admin'],
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(role))

  /**
   * Tap-outside to close the drawer on small screens only.
   * Intentionally **no dimmed backdrop** — a `fixed` + `bg-black/50` layer was
   * reported as persisting across routes / feeling like the “whole site” was
   * greyed out. Transparent layer keeps the same hit target without visual tint.
   */
  const showMobileTapShield = sidebarOpen && isMobileNav

  return (
    <div className="min-h-screen bg-gray-50">
      {showMobileTapShield ? (
        <button
          type="button"
          className="fixed inset-0 z-[35] cursor-default bg-transparent"
          aria-label="Close menu"
          onClick={closeSidebar}
        />
      ) : null}

      <aside
        className={`
        fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-gradient-to-b from-[#1a1f71] to-[#0f1545] text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
      >
        <div className="flex-shrink-0 p-6">
          <div className="mb-8 flex items-center justify-between gap-2">
            <Link
              href="/dashboard"
              className="flex min-w-0 flex-1 items-center gap-2"
              onClick={closeSidebar}
            >
              <Logo variant="light" className="h-9 w-auto shrink-0" priority />
              <span className="truncate text-lg font-medium tracking-tight">FIZAM</span>
            </Link>
            <button type="button" onClick={closeSidebar} className="shrink-0 lg:hidden" aria-label="Close menu">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    active ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'
                  }`}
                  onClick={closeSidebar}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto flex-shrink-0 border-t border-white/10 p-6">
          <div className="mb-4 text-sm text-blue-200">
            <div className="font-medium text-white">{user?.fullName}</div>
            <div>{user?.email}</div>
            <div className="mt-1 capitalize text-xs opacity-80">{role.replace('_', ' ')}</div>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-red-200 transition-colors hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
                aria-label="Open menu"
                aria-expanded={sidebarOpen}
              >
                <Menu className="h-6 w-6 text-[#1a1f71]" />
              </button>
              <h1 className="text-xl font-semibold text-[#1a1f71] lg:text-2xl">{title}</h1>
            </div>
            <Link href="/" className="text-sm text-[#2563eb] hover:underline">
              View Site
            </Link>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

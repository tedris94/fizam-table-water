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
  ChevronDown,
  Layers,
  Ruler,
  Tags,
  Mail,
  Shield,
  UserCog,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { DASHBOARD_MENU } from '@/lib/capabilities'
import { Logo } from '@/components/frontend/Logo'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  role?: string
}

const MENU_ICONS: Record<string, typeof LayoutDashboard> = {
  home: LayoutDashboard,
  analytics: TrendingUp,
  products: Package,
  orders: ShoppingCart,
  shipping: MapPin,
  team: Users,
  careers: Briefcase,
  applications: FileText,
  organogram: Users,
  cms: LayoutIcon,
  settings: Settings,
  'email-templates': Mail,
  users: UserCog,
  roles: Shield,
  diagnostics: Activity,
}

const CHILD_ICONS: Record<string, typeof Package> = {
  '/dashboard/products': Package,
  '/dashboard/products/categories': Layers,
  '/dashboard/products/sizes': Ruler,
  '/dashboard/products/tags': Tags,
}

export function DashboardLayout({ children, title, role: roleProp }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const { signOut, user, roleName, hasAnyCap, hasCap } = useAuth()
  const role = user?.role ?? roleProp ?? 'user'
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

  const handleSignOut = () => {
    void signOut()
  }

  useEffect(() => {
    for (const item of DASHBOARD_MENU) {
      if (
        item.children &&
        item.children.length > 0 &&
        (pathname === item.path || pathname.startsWith(item.path + '/'))
      ) {
        setOpenSections((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: true }))
      }
    }
  }, [pathname])

  const filteredMenuItems = DASHBOARD_MENU.filter((item) => hasAnyCap(item.capabilities))

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
        <div className="flex-shrink-0 border-b border-white/10 p-6 pb-4">
          <div className="flex items-center justify-between gap-2">
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
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-3">
          {filteredMenuItems.map((item) => {
            const Icon = MENU_ICONS[item.id] ?? LayoutDashboard
            const visibleChildren = item.children?.filter((child) => hasCap(child.capability)) ?? []
            const isCollapsibleSection = visibleChildren.length > 0
            const sectionOpen = openSections[item.id] ?? false
            const active =
              pathname === item.path ||
              (isCollapsibleSection && pathname.startsWith(item.path + '/'))

            if (isCollapsibleSection) {
              return (
                <div key={item.path}>
                  <button
                    type="button"
                    onClick={() => setOpenSections((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                      active ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sectionOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {sectionOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-2">
                      {visibleChildren.map((child) => {
                        const ChildIcon = CHILD_ICONS[child.path] ?? (item.id === 'products' ? Package : FileText)
                        const childActive = pathname === child.path
                        return (
                          <Link
                            key={child.path}
                            href={child.path}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                              childActive
                                ? 'bg-white/20 text-white'
                                : 'text-blue-100 hover:bg-white/10'
                            }`}
                            onClick={closeSidebar}
                          >
                            <ChildIcon className="h-4 w-4 shrink-0" />
                            <span>{child.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  active ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'
                }`}
                onClick={closeSidebar}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex-shrink-0 border-t border-white/10 p-4">
          <div className="mb-4 text-sm text-blue-200">
            <div className="font-medium text-white">{user?.fullName}</div>
            <div>{user?.email}</div>
            <div className="mt-1 capitalize text-xs opacity-80">
              {(roleName ?? role).replace(/_/g, ' ')}
            </div>
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
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/" className="text-sm text-[#2563eb] hover:underline">
                View Site
              </Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

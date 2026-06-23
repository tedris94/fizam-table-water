'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@/payload-types'
import { hasAnyCapability, hasCapability } from '@/lib/capabilities'

type AuthContextType = {
  user: User | null
  capabilities: string[]
  roleName: string | null
  loading: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
  hasCap: (capability: string) => boolean
  hasAnyCap: (capabilityList: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [capabilities, setCapabilities] = useState<string[]>([])
  const [roleName, setRoleName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/session', { credentials: 'include' })
      if (res.ok) {
        const data = (await res.json()) as {
          user?: User | null
          capabilities?: string[]
          roleName?: string | null
        }
        setUser(data.user ?? null)
        setCapabilities(data.capabilities ?? [])
        setRoleName(data.roleName ?? null)
      } else {
        setUser(null)
        setCapabilities([])
        setRoleName(null)
      }
    } catch {
      setUser(null)
      setCapabilities([])
      setRoleName(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Still redirect — cookie may be cleared server-side.
    }
    setUser(null)
    setCapabilities([])
    setRoleName(null)
    window.location.assign('/login?signedOut=1')
  }, [])

  const hasCap = useCallback(
    (capability: string) => hasCapability(capabilities, capability),
    [capabilities],
  )

  const hasAnyCap = useCallback(
    (capabilityList: string[]) => hasAnyCapability(capabilities, capabilityList),
    [capabilities],
  )

  const value = useMemo(
    () => ({
      user,
      capabilities,
      roleName,
      loading,
      refresh,
      signOut,
      hasCap,
      hasAnyCap,
    }),
    [user, capabilities, roleName, loading, refresh, signOut, hasCap, hasAnyCap],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

/** Profile shape expected by legacy dashboard components */
export function useProfile() {
  const { user } = useAuth()
  if (!user) return null
  return {
    id: String(user.id),
    email: user.email,
    full_name: user.fullName,
    role: user.role,
  }
}

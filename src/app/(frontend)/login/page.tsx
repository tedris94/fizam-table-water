'use client'

import { Suspense, useEffect, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Logo } from '@/components/frontend/Logo'

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [demoEnabled, setDemoEnabled] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // If a Payload session cookie is already valid, jump straight to the dashboard.
  useEffect(() => {
    if (searchParams.get('signedOut') === '1') {
      setCheckingSession(false)
      return
    }

    let cancelled = false
    fetch('/api/users/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user?: unknown } | null) => {
        if (cancelled) return
        if (data?.user) {
          const redirect = searchParams.get('redirect') || '/dashboard'
          router.replace(redirect)
        } else {
          setCheckingSession(false)
        }
      })
      .catch(() => {
        if (!cancelled) setCheckingSession(false)
      })
    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  // Demo login card visibility is controlled from the dashboard (site settings).
  useEffect(() => {
    let cancelled = false
    fetch('/api/globals/site-settings', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { showLoginDemoCard?: boolean } | null) => {
        if (cancelled) return
        // Default to visible unless explicitly disabled in site settings.
        setDemoEnabled(data ? data.showLoginDemoCard !== false : false)
      })
      .catch(() => {
        if (!cancelled) setDemoEnabled(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.errors?.[0]?.message || 'Invalid email or password.')
        return
      }
      const redirect = searchParams.get('redirect') || '/dashboard'
      router.push(redirect)
      router.refresh()
    } catch {
      setError('Could not sign in. Please try again.')
    } finally {
      setPending(false)
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail)
    setPassword('demo123')
    setError('')
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1f71] via-[#2563eb] to-[#0ea5e9] flex items-center justify-center p-4 text-white">
        Checking your session…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f71] via-[#2563eb] to-[#0ea5e9] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Logo variant="dark" className="h-16 md:h-20 w-auto" priority />
            </div>
            <h1 className="text-2xl text-[#1a1f71] mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          {searchParams.get('signedOut') === '1' && (
            <div className="mb-6 rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              You have been signed out successfully.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-[#2563eb] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {pending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-[#2563eb] hover:underline">
              Back to Home
            </a>
          </div>

          {demoEnabled && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDemo((s) => !s)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <span className="text-sm font-semibold text-[#1a1f71]">Quick Demo Login</span>
              </div>
              <svg
                className={`w-5 h-5 text-[#2563eb] transition-transform ${showDemo ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDemo && (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-gray-600 text-center mb-3">
                  Click a card below to auto-fill credentials:
                </p>

                <button
                  type="button"
                  onClick={() => fillDemo('superadmin@fizam.com')}
                  className="w-full p-4 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all text-left border-2 border-transparent hover:border-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-base">Super Admin</div>
                      <div className="text-xs opacity-90 mt-1">superadmin@fizam.com</div>
                    </div>
                    <div className="text-2xl">👑</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemo('admin@fizam.com')}
                  className="w-full p-4 bg-gradient-to-r from-[#2563eb] to-[#0ea5e9] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all text-left border-2 border-transparent hover:border-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-base">Admin</div>
                      <div className="text-xs opacity-90 mt-1">admin@fizam.com</div>
                    </div>
                    <div className="text-2xl">⚙️</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemo('hr@fizam.com')}
                  className="w-full p-4 bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all text-left border-2 border-transparent hover:border-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-base">HR Manager</div>
                      <div className="text-xs opacity-90 mt-1">hr@fizam.com</div>
                    </div>
                    <div className="text-2xl">👥</div>
                  </div>
                </button>

                <p className="text-xs text-gray-500 text-center mt-3 bg-gray-50 py-2 px-3 rounded-lg">
                  Password auto-fills as:{' '}
                  <span className="font-mono font-semibold text-[#2563eb]">demo123</span>
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Run <code className="rounded bg-gray-100 px-1">pnpm seed</code> first to create
                  these accounts.
                </p>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-24 text-center text-white">Loading…</div>}>
      <LoginInner />
    </Suspense>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Rocket } from 'lucide-react'

export function LoginDemoToggle() {
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/globals/site-settings', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { showLoginDemoCard?: boolean } | null) => {
        if (cancelled) return
        setEnabled(data ? data.showLoginDemoCard !== false : true)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load setting.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function toggle(next: boolean) {
    setSaving(true)
    setNotice(null)
    setError(null)
    const previous = enabled
    setEnabled(next)
    try {
      const res = await fetch('/api/globals/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ showLoginDemoCard: next }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setNotice(next ? 'Demo card is now shown on the login page.' : 'Demo card is now hidden.')
    } catch {
      setEnabled(previous)
      setError('Could not save the setting. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
          <Rocket className="w-5 h-5 text-cyan-600" />
        </div>
        <h3 className="text-xl text-[#1a1f71]">Login Page</h3>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-[#1a1f71] mb-1">Quick Demo Login card</div>
          <div className="text-sm text-gray-600">
            Show the demo credentials card on the public /login page.
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            disabled={loading || saving}
            onChange={(e) => toggle(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
        </label>
      </div>

      {notice && <p className="mt-3 text-sm text-green-600">{notice}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  )
}

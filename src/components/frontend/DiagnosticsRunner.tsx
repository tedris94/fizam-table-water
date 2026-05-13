'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'

type DiagnosticStatus = 'checking' | 'success' | 'error'

type DiagnosticResult = {
  name: string
  status: DiagnosticStatus
  message: string
  details?: string
}

type Check = {
  name: string
  run: () => Promise<{ message: string; details?: string }>
}

const checks: Check[] = [
  {
    name: 'Public products API',
    run: async () => {
      const res = await fetch('/api/products?limit=1&depth=0', {
        signal: AbortSignal.timeout(10000),
      })
      const text = await res.text()
      if (!res.ok) throw new Error(`Status ${res.status}: ${text.slice(0, 200)}`)
      const data = JSON.parse(text)
      const count = Array.isArray(data?.docs) ? data.docs.length : 0
      return {
        message: `Products endpoint responded (${count} item${count === 1 ? '' : 's'} in this page)`,
        details: text.slice(0, 1500),
      }
    },
  },
  {
    name: 'Auth session check',
    run: async () => {
      const res = await fetch('/api/users/me', {
        credentials: 'include',
        signal: AbortSignal.timeout(10000),
      })
      const text = await res.text()
      if (!res.ok && res.status !== 401) {
        throw new Error(`Status ${res.status}: ${text.slice(0, 200)}`)
      }
      const data = text ? JSON.parse(text) : {}
      const loggedIn = Boolean(data?.user)
      return {
        message: loggedIn
          ? `Auth service working — signed in as ${data.user.email}`
          : 'Auth service working — no active session',
        details: text.slice(0, 1500),
      }
    },
  },
  {
    name: 'Public site accessibility',
    run: async () => {
      const res = await fetch('/', { signal: AbortSignal.timeout(10000) })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      return {
        message: 'Home page reachable',
        details: `HTTP ${res.status}`,
      }
    },
  },
  {
    name: 'Payload admin shell',
    run: async () => {
      const res = await fetch('/admin', { signal: AbortSignal.timeout(10000), redirect: 'manual' })
      if (res.status >= 500) throw new Error(`Status ${res.status}`)
      return {
        message: 'Admin route reachable',
        details: `HTTP ${res.status}`,
      }
    },
  },
]

function statusIcon(status: DiagnosticStatus) {
  if (status === 'checking') return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />
  if (status === 'success') return <CheckCircle className="w-6 h-6 text-green-500" />
  return <XCircle className="w-6 h-6 text-red-500" />
}

function statusColor(status: DiagnosticStatus) {
  if (status === 'checking') return 'border-blue-200 bg-blue-50'
  if (status === 'success') return 'border-green-200 bg-green-50'
  return 'border-red-200 bg-red-50'
}

export function DiagnosticsRunner() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [running, setRunning] = useState(false)

  const run = useCallback(async () => {
    setRunning(true)
    const next: DiagnosticResult[] = checks.map((c) => ({
      name: c.name,
      status: 'checking',
      message: 'Checking…',
    }))
    setResults(next)

    for (let i = 0; i < checks.length; i += 1) {
      try {
        const out = await checks[i].run()
        next[i] = { name: checks[i].name, status: 'success', message: out.message, details: out.details }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        next[i] = { name: checks[i].name, status: 'error', message: 'Check failed', details: message }
      }
      setResults([...next])
    }

    setRunning(false)
  }, [])

  useEffect(() => {
    void run()
  }, [run])

  return (
    <>
      <div className="mb-8 text-center">
        <button
          type="button"
          onClick={() => void run()}
          disabled={running}
          className="bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
        >
          <RefreshCw className={`w-5 h-5 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Running Tests…' : 'Re-run Diagnostics'}
        </button>
      </div>

      <div className="space-y-6">
        {results.map((result, idx) => (
          <div key={idx} className={`border-2 rounded-2xl p-6 ${statusColor(result.status)}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">{statusIcon(result.status)}</div>
              <div className="flex-1">
                <h3 className="text-xl text-[#1a1f71] mb-2">{result.name}</h3>
                <p className="text-gray-700 mb-2">{result.message}</p>
                {result.details && (
                  <details className="mt-4">
                    <summary className="text-sm text-gray-600 cursor-pointer hover:text-[#2563eb]">
                      View Details
                    </summary>
                    <pre className="mt-2 p-4 bg-white rounded-lg text-xs overflow-x-auto">
                      {result.details}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
        <h3 className="text-lg text-[#1a1f71] mb-3 font-semibold">Troubleshooting Tips</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-[#2563eb]">•</span>
            <span>Ensure the Next.js + Payload dev server is running locally.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2563eb]">•</span>
            <span>Run <code className="rounded bg-white px-1">pnpm payload migrate</code> if the database schema is out of date.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2563eb]">•</span>
            <span>Check your browser console (F12) for more detailed error messages.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2563eb]">•</span>
            <span>For production, verify your Namecheap Stellar passenger logs.</span>
          </li>
        </ul>
      </div>
    </>
  )
}

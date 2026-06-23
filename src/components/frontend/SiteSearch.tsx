'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

type SiteSearchProps = {
  placeholder?: string
  action?: '/search' | '/order'
  className?: string
  inputClassName?: string
  buttonClassName?: string
  initialQuery?: string
}

export function SiteSearch({
  placeholder = 'Search products…',
  action = '/search',
  className = '',
  inputClassName = '',
  buttonClassName = '',
  initialQuery = '',
}: SiteSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    const target = action === '/order' ? `/order?q=${encodeURIComponent(q)}` : `/search?q=${encodeURIComponent(q)}`
    router.push(target)
  }

  return (
    <form onSubmit={onSubmit} className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-full border border-white/20 bg-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder:text-blue-100 focus:border-white/40 focus:bg-white/15 focus:outline-none ${inputClassName}`}
          aria-label="Search"
        />
      </div>
      <button
        type="submit"
        className={`shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#1a1f71] hover:bg-blue-50 ${buttonClassName}`}
      >
        Search
      </button>
    </form>
  )
}

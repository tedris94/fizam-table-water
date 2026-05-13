'use client'

import { Phone, ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import { Logo } from '@/components/frontend/Logo'
import { useAuth } from '@/contexts/AuthContext'

const DEFAULT_HERO_IMAGE = '/images/hero.png'

type HeroProps = {
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroImageUrl?: string | null
}

export function Hero({
  heroTitle = 'Premium Quality Water',
  heroSubtitle = 'Experience the purity and great taste of Fizam Table Water. Quality certified products for your health and refreshment.',
  heroImageUrl,
}: HeroProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, loading } = useAuth()
  const isLoggedIn = Boolean(user)
  const imgSrc = heroImageUrl || DEFAULT_HERO_IMAGE

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (targetId.startsWith('#')) {
      e.preventDefault()
      const element = document.querySelector(targetId)
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
        setMobileMenuOpen(false)
      }
    }
  }

  return (
    <div className="relative bg-gradient-to-br from-[#1a1f71] via-[#2563eb] to-[#0ea5e9] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <nav className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label="Fizam Table Water — Home">
            <Logo variant="light" className="h-12 md:h-16 w-auto" priority />
            <span className="text-xl md:text-2xl font-medium tracking-tight">
              FIZAM Table Water
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="/about" className="hover:text-blue-200 transition-colors">
              About
            </a>
            <a href="#products" onClick={(e) => smoothScroll(e, '#products')} className="hover:text-blue-200 transition-colors">
              Products
            </a>
            <a href="#quality" onClick={(e) => smoothScroll(e, '#quality')} className="hover:text-blue-200 transition-colors">
              Quality
            </a>
            <a href="#sales" onClick={(e) => smoothScroll(e, '#sales')} className="hover:text-blue-200 transition-colors">
              Sales Channels
            </a>
            <a href="/team" className="hover:text-blue-200 transition-colors">
              Team
            </a>
            <a href="/careers" className="hover:text-blue-200 transition-colors">
              Careers
            </a>
            <a href="/order" className="bg-white text-[#1a1f71] px-6 py-2 rounded-full hover:bg-blue-50 transition-colors">
              Order Now
            </a>
            {!loading && isLoggedIn ? (
              <a href="/dashboard" className="hover:text-blue-200 transition-colors">
                Dashboard
              </a>
            ) : (
              <a href="/login" className="hover:text-blue-200 transition-colors">
                Login
              </a>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <a href="/about" className="block hover:text-blue-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              About
            </a>
            <a href="#products" onClick={(e) => smoothScroll(e, '#products')} className="block hover:text-blue-200 transition-colors">
              Products
            </a>
            <a href="#quality" onClick={(e) => smoothScroll(e, '#quality')} className="block hover:text-blue-200 transition-colors">
              Quality
            </a>
            <a href="#sales" onClick={(e) => smoothScroll(e, '#sales')} className="block hover:text-blue-200 transition-colors">
              Sales Channels
            </a>
            <a href="/team" className="block hover:text-blue-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Team
            </a>
            <a href="/careers" className="block hover:text-blue-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Careers
            </a>
            <a
              href="/order"
              className="block bg-white text-[#1a1f71] px-6 py-2 rounded-full hover:bg-blue-50 transition-colors text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Order Now
            </a>
            {!loading && isLoggedIn ? (
              <a
                href="/dashboard"
                className="block hover:text-blue-200 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </a>
            ) : (
              <a href="/login" className="block hover:text-blue-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Login
              </a>
            )}
          </div>
        )}
      </nav>

      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="text-sm">Refreshingly Pure</span>
            </div>
            <h1 className="text-5xl md:text-7xl mb-6">{heroTitle}</h1>
            <p className="text-xl mb-8 text-blue-100">{heroSubtitle}</p>
            <div className="flex flex-wrap gap-4">
              <a href="/order" className="bg-white text-[#1a1f71] px-8 py-4 rounded-full hover:bg-blue-50 transition-colors flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Order for Home
              </a>
              <a
                href="tel:+2349166698406"
                className="bg-transparent border-2 border-white px-8 py-4 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call Us
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="relative z-10 aspect-square rounded-2xl shadow-2xl overflow-hidden">
              <Image
                src={imgSrc}
                alt="Fizam Table Water Products"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 90vw, (max-width: 1024px) 50vw, 600px"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-transparent rounded-2xl pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  )
}

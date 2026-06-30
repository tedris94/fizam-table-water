'use client'

import { ReactNode } from 'react'
import { Phone, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { SiteSearch } from '@/components/frontend/SiteSearch'

const DEFAULT_HERO_IMAGE = '/images/hero.png'

type Cta = { label?: string | null; href?: string | null } | null | undefined

type HeroProps = {
  badge?: string | null
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroImageUrl?: string | null
  primaryCta?: Cta
  secondaryCta?: Cta
  /** Optional header (navigation) rendered transparently over the hero gradient. */
  header?: ReactNode
  /** Show the search box (used on the home page). */
  showSearch?: boolean
}

export function Hero({
  badge = 'Refreshingly Pure',
  heroTitle = 'Premium Quality Water',
  heroSubtitle = 'Experience the purity and great taste of Fizam Table Water. Quality certified products for your health and refreshment.',
  heroImageUrl,
  primaryCta,
  secondaryCta,
  header,
  showSearch = false,
}: HeroProps) {
  const imgSrc = heroImageUrl || DEFAULT_HERO_IMAGE
  const primaryLabel = primaryCta?.label || 'Order for Home'
  const primaryHref = primaryCta?.href || '/order'
  const secondaryLabel = secondaryCta?.label || 'Call Us'
  const secondaryHref = secondaryCta?.href || 'tel:+2349166698406'

  return (
    <div className="relative bg-gradient-to-br from-[#1a1f71] via-[#2563eb] to-[#0ea5e9] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      {header}

      {showSearch && (
        <div className="relative z-10 container mx-auto px-4 pb-4">
          <div className="mx-auto max-w-xl">
            <SiteSearch placeholder="Search products and pages…" />
          </div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            {badge && (
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="text-sm">{badge}</span>
              </div>
            )}
            <h1 className="text-5xl md:text-7xl mb-6">{heroTitle}</h1>
            <p className="text-xl mb-8 text-blue-100">{heroSubtitle}</p>
            <div className="flex flex-wrap gap-4">
              <a
                href={primaryHref}
                className="bg-white text-[#1a1f71] px-8 py-4 rounded-full hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {primaryLabel}
              </a>
              <a
                href={secondaryHref}
                className="bg-transparent border-2 border-white px-8 py-4 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                {secondaryLabel}
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg md:max-w-none">
            <div className="relative z-10 aspect-[3/2] rounded-2xl bg-white shadow-2xl overflow-hidden">
              <Image
                src={imgSrc}
                alt="Fizam Table Water Products"
                fill
                className="object-contain object-center"
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

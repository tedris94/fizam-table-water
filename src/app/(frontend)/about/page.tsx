import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import path from 'path'
import { access } from 'fs/promises'
import { Award, Building2, Droplets, Shield, Target } from 'lucide-react'
import { SimpleNavbar } from '@/components/frontend/SimpleNavbar'
import { Footer } from '@/components/frontend/Footer'
import { BackToTop } from '@/components/frontend/BackToTop'

export const metadata: Metadata = {
  title: 'About Us | Fizam Table Water',
  description:
    'Learn about FIZAM Table Water—NAFDAC-certified drinking water for Nigerian homes, our standards, and our production story.',
}

async function hasFactoryPhoto(): Promise<boolean> {
  try {
    await access(path.join(process.cwd(), 'public', 'images', 'factory.jpg'))
    return true
  } catch {
    return false
  }
}

export default async function AboutPage() {
  const showFactoryImage = await hasFactoryPhoto()

  return (
    <>
      <SimpleNavbar />
      <main className="min-h-screen bg-white pt-24 md:pt-28">
        <div className="border-b border-blue-100 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto max-w-4xl px-4 py-10 md:py-14">
            <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="text-[#2563eb] hover:underline">
                    Home
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="font-medium text-gray-700">About us</li>
              </ol>
            </nav>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#1a1f71] md:text-5xl">
              About FIZAM Table Water
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
              We produce clean, great-tasting table water for families and businesses across
              Nigeria—with the certifications and care you expect from a brand you can trust.
            </p>
          </div>
        </div>

        <div className="container mx-auto max-w-5xl px-4 py-16 md:py-20">
          <div className="grid gap-12 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#1a1f71] md:text-3xl">Our story</h2>
              <p className="mt-4 leading-relaxed text-gray-600">
                FIZAM exists to take the guesswork out of hydration. Every batch is treated with
                disciplined processes, trained people, and a simple belief: water should be safe,
                affordable, and refreshingly easy to love.
              </p>
              <p className="mt-4 leading-relaxed text-gray-600">
                From retail packs to wholesale and pickup at our facility, we are building a
                dependable supply you can plan around—whether you are stocking your home or serving
                your customers.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 shadow-sm">
              <Target className="h-10 w-10 text-[#2563eb]" aria-hidden />
              <h3 className="mt-4 text-xl font-semibold text-[#1a1f71]">What we stand for</h3>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li className="flex gap-2">
                  <span className="font-semibold text-[#1a1f71]">Quality</span> — standards you
                  can verify, not just words on a label.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-[#1a1f71]">Integrity</span> — honest pricing
                  and clear communication at every touchpoint.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-[#1a1f71]">Nigeria first</span> — built for
                  local realities, from logistics to taste preferences.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <section className="border-y border-blue-100 bg-slate-50 py-16 md:py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-bold text-[#1a1f71] md:text-3xl">Our facility</h2>
              <p className="mt-3 text-gray-600">
                A glimpse of where your water is produced. Replace the placeholder below with your
                own photography when ready.
              </p>
            </div>

            {showFactoryImage ? (
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
                <Image
                  src="/images/factory.jpg"
                  alt="FIZAM production facility"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority
                />
              </div>
            ) : (
              <div className="relative flex aspect-[21/9] min-h-[220px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#2563eb]/35 bg-gradient-to-br from-slate-100 via-white to-blue-50 text-center shadow-inner">
                <Building2 className="h-14 w-14 text-[#1a1f71]/40" aria-hidden />
                <p className="mt-4 px-4 text-lg font-semibold text-[#1a1f71]">
                  Factory photo placeholder
                </p>
                <p className="mt-2 max-w-md px-4 text-sm text-gray-600">
                  Add your image as{' '}
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-[#1a1f71] ring-1 ring-blue-100">
                    public/images/factory.jpg
                  </code>{' '}
                  — this page will display it automatically. Recommended: wide landscape (e.g. 2400
                  × 1000px or larger).
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="container mx-auto max-w-5xl px-4 py-16 md:py-20">
          <h2 className="text-center text-2xl font-bold text-[#1a1f71] md:text-3xl">
            Why customers choose FIZAM
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: 'Certified quality',
                text: 'Production aligned with regulatory expectations and internal checks you can rely on.',
              },
              {
                icon: Droplets,
                title: 'Pure & refreshing',
                text: 'Filtration and treatment designed for clarity, consistency, and great taste.',
              },
              {
                icon: Award,
                title: 'Dependable supply',
                text: 'Order for delivery or factory pickup—we are set up for both retail and bulk needs.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a1f71] to-[#2563eb] text-white">
                  <item.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 font-semibold text-[#1a1f71]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-[#1a1f71] to-[#2563eb] px-8 py-12 text-center text-white shadow-xl">
            <p className="text-lg font-medium md:text-xl">Ready to order or partner with us?</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/order"
                className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#1a1f71] shadow-md transition hover:bg-blue-50"
              >
                Order water
              </Link>
              <Link
                href="/#contact"
                className="inline-flex min-w-[180px] items-center justify-center rounded-full border-2 border-white/80 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Contact us
              </Link>
              <Link
                href="/team"
                className="inline-flex min-w-[180px] items-center justify-center rounded-full border-2 border-white/80 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Meet the team
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}

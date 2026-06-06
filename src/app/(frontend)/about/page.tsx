import Image from 'next/image'
import Link from 'next/link'
import { Award, Droplets, Factory, Shield } from 'lucide-react'
import { SimpleNavbar } from '@/components/frontend/SimpleNavbar'
import { Footer } from '@/components/frontend/Footer'
import { BackToTop } from '@/components/frontend/BackToTop'
import { buildPageMetadata, DEFAULT_KEYWORDS, titleWithBrand } from '@/lib/seo'

export const metadata = buildPageMetadata({
  title: titleWithBrand('About Fizam — Alfurat Nigeria Limited'),
  description:
    'About Fizam Table Water (fizam.ng): a product of Alfurat Nigeria Limited. Premium 50cl & 75cl bottled water and sachet water — reverse osmosis and ozonization purification for FCT and Nigeria.',
  path: '/about',
  image: '/images/factory.png',
  keywords: [
    'Fizam',
    'fizam.ng',
    'About Fizam',
    'Alfurat Nigeria Limited',
    'Fizam Table Water',
    ...DEFAULT_KEYWORDS,
  ],
})

const HIGHLIGHTS = [
  {
    icon: Shield,
    title: 'Quality & safety first',
    text: 'Advanced purification including reverse osmosis and ozonization removes chemical, organic, inorganic, and biological contaminants.',
  },
  {
    icon: Droplets,
    title: 'Fresh in every sip',
    text: 'Bottled water (50cl and 75cl) and sachet water produced for freshness, purity, and satisfaction.',
  },
  {
    icon: Factory,
    title: 'Modern production',
    text: 'State-of-the-art facilities and disciplined processes support dependable supply for homes and businesses.',
  },
  {
    icon: Award,
    title: 'Serving FCT & beyond',
    text: 'Positioned to deliver highly purified, refreshing water across the Federal Capital Territory and Nigeria.',
  },
] as const

export default function AboutPage() {
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
              About Us
            </h1>
            <p className="mt-6 text-lg font-medium text-[#2563eb]">
              Fizam Table Water — Purity, Refreshment, and Quality You Can Trust.
            </p>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-14 md:py-16">
          <div className="space-y-6 text-lg leading-relaxed text-gray-700">
            <p>
              <strong className="text-[#1a1f71]">Fizam Table Water</strong>, a product of{' '}
              <strong className="text-[#1a1f71]">Alfurat Nigeria Limited</strong>, is committed to
              delivering premium-quality drinking water designed to meet the hydration needs of
              individuals, families, and businesses. Our product range includes bottled water (50cl
              and 75cl) as well as sachet water, carefully produced to provide freshness, purity, and
              satisfaction in every sip.
            </p>
            <p>
              At Fizam, quality and safety remain our top priorities. Our water undergoes advanced
              purification processes, including reverse osmosis and ozonization, ensuring the removal
              of unwanted chemical substances, organic and inorganic impurities, and biological
              contaminants. This guarantees clean, safe, and reliable drinking water that meets high
              quality standards.
            </p>
            <p>
              With modern production facilities and a commitment to excellence, Fizam Table Water is
              positioned to serve the Federal Capital Territory (FCT) and beyond by providing highly
              purified, refreshing water products that complement everyday life.
            </p>
          </div>

          <p className="mt-10 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white px-6 py-5 text-center text-xl font-semibold text-[#1a1f71]">
            Fizam Table Water — Purity, Refreshment, and Quality You Can Trust.
          </p>
        </div>

        <section className="border-y border-blue-100 bg-slate-50 py-16 md:py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-bold text-[#1a1f71] md:text-3xl">Our facility</h2>
              <p className="mt-3 text-gray-600">
                A glimpse of where Fizam Table Water is produced — modern equipment and disciplined
                processes for every batch.
              </p>
            </div>

            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
              <Image
                src="/images/factory.png"
                alt="Fizam Table Water production facility — Alfurat Nigeria Limited"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-5xl px-4 py-16 md:py-20">
          <h2 className="text-center text-2xl font-bold text-[#1a1f71] md:text-3xl">
            Why customers choose Fizam
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a1f71] to-[#2563eb] text-white">
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

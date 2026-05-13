import { Droplets } from 'lucide-react'
import Image from 'next/image'
import { productSlug } from '@/lib/productSlug'

const POUR_IMAGE = '/images/product-side.png'
const DISPENSER_IMAGE = '/images/dispenser.png'
const BOTTLE_PACK_IMAGE = '/images/bottle-pack.jpg'

const PRODUCT_CARDS = [
  {
    name: 'Sachet Water',
    size: '30cl',
    description: 'Perfect for quick refreshment on the go',
    icon: '💧',
  },
  {
    name: 'Table Water',
    size: '50cl',
    description: 'Ideal for personal daily hydration',
    icon: '🚰',
  },
  {
    name: 'Table Water',
    size: '75cl',
    description: 'Great for sharing and family use',
    icon: '💦',
  },
  {
    name: 'Dispenser Bottle',
    size: '18.9L',
    description: 'Perfect for office and home dispensers',
    icon: '🏢',
  },
] as const

export function Products() {
  return (
    <section id="products" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-[#1a1f71] mb-4">Our Products</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Quality water in various sizes to meet all your hydration needs
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="order-2 lg:order-1">
            <div className="grid sm:grid-cols-2 gap-6">
              {PRODUCT_CARDS.map((product) => {
                const slug = productSlug(product.name, product.size)
                return (
                  <a
                    key={slug}
                    id={slug}
                    href={`/order#${slug}`}
                    aria-label={`Order ${product.name} ${product.size} on the order page`}
                    className="group block scroll-mt-32 bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
                  >
                    <div className="text-4xl mb-4">{product.icon}</div>
                    <h3 className="text-xl text-[#1a1f71] mb-2">{product.name}</h3>
                    <div className="text-2xl text-[#2563eb] mb-3">{product.size}</div>
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-[#2563eb] group-hover:underline">
                      Order this size →
                    </span>
                  </a>
                )
              })}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              {/* Tilted gradient backing */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] rounded-3xl transform rotate-3" />

              {/* Collage: dispenser hero + pour shot + bottle pack */}
              <div className="relative aspect-square grid grid-cols-5 grid-rows-2 gap-3 rounded-3xl bg-white p-3 shadow-2xl overflow-hidden">
                {/* Hero: dispenser bottle (tall left column, full height) */}
                <div className="relative col-span-3 row-span-2 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_28%,#1e3a8a_0%,#0c1e5e_55%,#050b2e_100%)]">
                  {/* Soft top highlight so the bottle reads as lit from above */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(186,230,253,0.22)_0%,transparent_55%)]" />
                  {/* Subtle vignette for depth */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.35)_100%)]" />
                  <Image
                    src={DISPENSER_IMAGE}
                    alt="Fizam Table Water dispenser bottle"
                    fill
                    sizes="(max-width: 768px) 55vw, (max-width: 1024px) 45vw, 360px"
                    className="object-contain scale-125 drop-shadow-[0_22px_30px_rgba(0,0,0,0.45)]"
                    priority
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent p-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-white">
                      18.9L Dispenser
                    </span>
                  </div>
                </div>

                {/* Top-right: pour shot */}
                <div className="relative col-span-2 row-span-1 rounded-2xl overflow-hidden ring-1 ring-blue-100">
                  <Image
                    src={POUR_IMAGE}
                    alt="Pure Fizam water poured into a glass"
                    fill
                    sizes="(max-width: 768px) 35vw, (max-width: 1024px) 25vw, 200px"
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1f71]/30 to-transparent" />
                </div>

                {/* Bottom-right: shrink-wrapped bottle pack */}
                <div className="relative col-span-2 row-span-1 rounded-2xl overflow-hidden ring-1 ring-blue-100">
                  <Image
                    src={BOTTLE_PACK_IMAGE}
                    alt="Pack of Fizam Table Water bottles"
                    fill
                    sizes="(max-width: 768px) 35vw, (max-width: 1024px) 25vw, 200px"
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a1f71]/40 to-transparent p-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-white/90">
                      Bottle Pack
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#1a1f71] to-[#2563eb] rounded-3xl p-12 text-white text-center">
          <Droplets className="w-16 h-16 mx-auto mb-6" />
          <h3 className="text-3xl mb-4">All Products Are Quality Certified</h3>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Every bottle of Fizam Table Water undergoes rigorous quality control processes to ensure
            you receive only the purest, safest water with great taste.
          </p>
        </div>
      </div>
    </section>
  )
}

import { Droplets } from 'lucide-react'
import Image from 'next/image'
import { productSlug } from '@/lib/productSlug'

const DISPENSER_IMAGE = '/images/dispenser.png'

export type ProductCard = {
  name: string
  size?: string | null
  description?: string | null
  icon?: string | null
  href?: string | null
}

const DEFAULT_PRODUCTS: ProductCard[] = [
  { name: 'Table Water', size: '35cl', description: 'Compact bottle for everyday hydration', icon: '💧' },
  { name: 'Table Water', size: '50cl', description: 'Ideal for personal daily hydration', icon: '🚰' },
  { name: 'Table Water', size: '75cl', description: 'Great for sharing and family use', icon: '💦' },
  { name: 'Sachet Water', size: '50cl', description: 'Perfect for quick refreshment on the go', icon: '💧' },
  { name: 'Dispenser', size: '19L', description: 'Perfect for office and home dispensers', icon: '🏢' },
]

type ProductsProps = {
  heading?: string | null
  subheading?: string | null
  items?: ProductCard[] | null
  bannerHeading?: string | null
  bannerBody?: string | null
}

export function Products({
  heading = 'Our Products',
  subheading = 'Quality water in various sizes to meet all your hydration needs',
  items,
  bannerHeading = 'All Products Are Quality Certified',
  bannerBody = 'Every bottle of Fizam Table Water undergoes rigorous quality control processes to ensure you receive only the purest, safest water with great taste.',
}: ProductsProps) {
  const products = items && items.length > 0 ? items : DEFAULT_PRODUCTS

  return (
    <section id="products" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-[#1a1f71] mb-4">{heading}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subheading}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="order-2 lg:order-1">
            <div className="grid sm:grid-cols-2 gap-6">
              {products.map((product, index) => {
                const slug = productSlug(product.name, product.size ?? '')
                const href = product.href || `/order#${slug}`
                return (
                  <a
                    key={`${slug}-${index}`}
                    id={slug}
                    href={href}
                    aria-label={`Order ${product.name} ${product.size ?? ''} on the order page`}
                    data-track="product"
                    data-resource={`${product.name} ${product.size ?? ''}`.trim()}
                    className="group block scroll-mt-32 bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
                  >
                    <div className="text-4xl mb-4">{product.icon}</div>
                    <h3 className="text-xl text-[#1a1f71] mb-2">{product.name}</h3>
                    {product.size && <div className="text-2xl text-[#2563eb] mb-3">{product.size}</div>}
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
              <div className="relative aspect-[4/5] rounded-3xl bg-white p-3 shadow-2xl overflow-hidden">
                <div className="relative h-full overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_50%_28%,#1e3a8a_0%,#0c1e5e_55%,#050b2e_100%)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(186,230,253,0.22)_0%,transparent_55%)]" />
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
                      19L Dispenser
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#1a1f71] to-[#2563eb] rounded-3xl p-12 text-white text-center">
          <Droplets className="w-16 h-16 mx-auto mb-6" />
          <h3 className="text-3xl mb-4">{bannerHeading}</h3>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">{bannerBody}</p>
        </div>
      </div>
    </section>
  )
}

import { getIcon } from '@/components/frontend/blocks/icons'

type Channel = {
  icon?: string | null
  title: string
  description?: string | null
  features?: { value: string }[] | null
}
type Cta = { label?: string | null; href?: string | null } | null | undefined

type SalesChannelsProps = {
  heading?: string | null
  subheading?: string | null
  channels?: Channel[] | null
  ctaHeading?: string | null
  ctaBody?: string | null
  primaryCta?: Cta
  secondaryCta?: Cta
}

const DEFAULT_CHANNELS: Channel[] = [
  {
    icon: 'store',
    title: 'Retail Sales',
    description: 'Find us at major retail stores and supermarkets nationwide',
    features: [{ value: 'Convenient locations' }, { value: 'Always available' }, { value: 'Multiple sizes' }],
  },
  {
    icon: 'warehouse',
    title: 'Wholesale',
    description: 'Bulk purchasing options for businesses and distributors',
    features: [{ value: 'Competitive pricing' }, { value: 'Large quantities' }, { value: 'Regular supply' }],
  },
  {
    icon: 'factory',
    title: 'Direct from Factory',
    description: 'Purchase directly from our production facility',
    features: [{ value: 'Best prices' }, { value: 'Fresh production' }, { value: 'Custom orders' }],
  },
  {
    icon: 'truck',
    title: 'Home Delivery',
    description: 'Order online and get fresh water delivered to your doorstep',
    features: [{ value: 'Convenient ordering' }, { value: 'Fast delivery' }, { value: 'Scheduled service' }],
  },
]

export function SalesChannels({
  heading = 'How to Buy',
  subheading = 'Multiple convenient ways to get your Fizam Table Water',
  channels,
  ctaHeading = 'Ready to Order?',
  ctaBody = "Contact us today to place your order or learn more about our distribution options. We're here to serve you with the best quality water.",
  primaryCta,
  secondaryCta,
}: SalesChannelsProps) {
  const items = channels && channels.length > 0 ? channels : DEFAULT_CHANNELS
  const primaryLabel = primaryCta?.label || 'Get it Delivered'
  const primaryHref = primaryCta?.href || '/order'
  const secondaryLabel = secondaryCta?.label || 'Call Now'
  const secondaryHref = secondaryCta?.href || 'tel:+1234567890'

  return (
    <section id="sales" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-[#1a1f71] mb-4">{heading}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subheading}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((channel, index) => {
            const Icon = getIcon(channel.icon)
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-[#2563eb]"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#1a1f71] to-[#2563eb] rounded-2xl flex items-center justify-center mb-6 transform -rotate-3">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-[#1a1f71] mb-3">{channel.title}</h3>
                <p className="text-gray-600 mb-6">{channel.description}</p>
                <ul className="space-y-2">
                  {(channel.features ?? []).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-[#2563eb] rounded-full"></div>
                      {feature.value}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="mt-16 bg-gradient-to-r from-[#1a1f71] via-[#2563eb] to-[#0ea5e9] rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-12 items-center">
            <div className="text-white">
              <h3 className="text-3xl mb-4">{ctaHeading}</h3>
              <p className="text-xl text-blue-100 mb-6">{ctaBody}</p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={primaryHref}
                  className="bg-white text-[#1a1f71] px-8 py-3 rounded-full hover:bg-blue-50 transition-colors inline-block"
                >
                  {primaryLabel}
                </a>
                <a
                  href={secondaryHref}
                  className="bg-transparent border-2 border-white px-8 py-3 rounded-full hover:bg-white/10 transition-colors inline-block"
                >
                  {secondaryLabel}
                </a>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4">
              {items.slice(0, 4).map((channel, index) => {
                const Icon = getIcon(channel.icon)
                return (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-center aspect-square"
                  >
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

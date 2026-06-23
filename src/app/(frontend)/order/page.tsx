import { Suspense } from 'react'
import { SimpleNavbar } from '@/components/frontend/SimpleNavbar'
import { buildPageMetadata, titleWithBrand } from '@/lib/seo'
import { Footer } from '@/components/frontend/Footer'
import { BackToTop } from '@/components/frontend/BackToTop'
import { OrderCheckout } from '@/components/order/OrderCheckout'
import { HashHighlighter } from '@/components/frontend/HashHighlighter'

export const metadata = buildPageMetadata({
  title: titleWithBrand('Order Table Water Online'),
  description:
    'Order Fizam table water, sachets, and dispenser bottles online. Fast delivery across Nigeria — secure Paystack checkout at fizam.ng.',
  path: '/order',
})

export const dynamic = 'force-dynamic'

export default function OrderPage() {
  return (
    <>
      <SimpleNavbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl text-[#1a1f71] mb-4">Order Fizam Water</h1>
            <p className="text-xl text-gray-600">
              Fresh, quality-certified water delivered to your doorstep
            </p>
          </div>
          <Suspense fallback={<div className="text-center text-gray-500">Loading checkout…</div>}>
            <OrderCheckout />
          </Suspense>
        </div>
      </div>
      <Footer />
      <BackToTop />
      <HashHighlighter />
    </>
  )
}

import { buildPageMetadata, titleWithBrand } from '@/lib/seo'

export const metadata = buildPageMetadata({
  title: titleWithBrand('Order Confirmed'),
  path: '/order/success',
  noIndex: true,
})

export default function OrderSuccessLayout({ children }: { children: React.ReactNode }) {
  return children
}

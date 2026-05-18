import { buildPageMetadata, titleWithBrand } from '@/lib/seo'

export const metadata = buildPageMetadata({
  title: titleWithBrand('Login'),
  path: '/login',
  noIndex: true,
})

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}

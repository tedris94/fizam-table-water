import { buildPageMetadata } from '@/lib/seo'

export const metadata = buildPageMetadata({
  title: 'Test — Fizam',
  path: '/test',
  noIndex: true,
})

export default function TestPage() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <h1 className="text-6xl text-white">TEST PAGE WORKS!</h1>
    </div>
  )
}

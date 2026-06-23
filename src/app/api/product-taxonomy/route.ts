import { NextResponse } from 'next/server'
import { fetchProductTaxonomy } from '@/lib/productTaxonomy'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const taxonomy = await fetchProductTaxonomy(true)
    return NextResponse.json(taxonomy, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (e) {
    console.error('[product-taxonomy GET]', e)
    return NextResponse.json({ error: 'Failed to load taxonomy' }, { status: 500 })
  }
}

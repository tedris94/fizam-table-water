import { getPayloadSingleton } from '@/lib/payload'
import type { Header as HeaderGlobal, Footer as FooterGlobal } from '@/payload-types'

/** Load the Site Header global; returns null on any failure (renderer falls back to defaults). */
export async function getHeaderData(): Promise<HeaderGlobal | null> {
  try {
    const payload = await getPayloadSingleton()
    return (await payload.findGlobal({ slug: 'header', depth: 0 })) as HeaderGlobal
  } catch (error) {
    console.error('Payload header fetch failed:', error)
    return null
  }
}

/** Load the Site Footer global; returns null on any failure (renderer falls back to defaults). */
export async function getFooterData(): Promise<FooterGlobal | null> {
  try {
    const payload = await getPayloadSingleton()
    return (await payload.findGlobal({ slug: 'footer', depth: 0 })) as FooterGlobal
  } catch (error) {
    console.error('Payload footer fetch failed:', error)
    return null
  }
}

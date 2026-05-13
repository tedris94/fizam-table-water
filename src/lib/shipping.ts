import { getPayloadSingleton } from '@/lib/payload'

export const DEFAULT_SHIPPING_FEE = 1500
export const DEFAULT_SHIPPING_ZONE_LABEL = 'Standard'

type RawZone = {
  id: number | string
  name: string
  fee: number
  isActive?: boolean | null
  priority?: number | null
  states?: { value: string }[] | null
  cities?: { value: string }[] | null
  lgas?: { value: string }[] | null
}

export type NormalizedZone = {
  id: number | string
  name: string
  fee: number
  isActive: boolean
  priority: number
  states: string[]
  cities: string[]
  lgas: string[]
}

function normalize(zone: RawZone): NormalizedZone {
  return {
    id: zone.id,
    name: zone.name,
    fee: Number(zone.fee || 0),
    isActive: zone.isActive !== false,
    priority: Number(zone.priority ?? 100),
    states: (zone.states ?? []).map((s) => s.value).filter(Boolean),
    cities: (zone.cities ?? []).map((c) => c.value).filter(Boolean),
    lgas: (zone.lgas ?? []).map((l) => l.value).filter(Boolean),
  }
}

const norm = (s: string) => s.trim().toLowerCase()

export async function loadShippingZones(): Promise<NormalizedZone[]> {
  const payload = await getPayloadSingleton()
  const result = await payload.find({
    collection: 'shipping-zones',
    where: { isActive: { not_equals: false } },
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })
  return (result.docs as unknown as RawZone[]).map(normalize)
}

/**
 * Pick the best delivery-location rule for an address.
 *
 * Match order (most specific first): **LGA** (if the location lists LGAs and the
 * customer LGA matches) → **City / area** → **State**. Within each tier, the
 * lowest `priority` number wins when several locations match.
 */
export function matchZone(
  zones: NormalizedZone[],
  state: string,
  city: string,
  lga: string,
): NormalizedZone | null {
  const stateLc = state ? norm(state) : ''
  const cityLc = city ? norm(city) : ''
  const lgaLc = lga ? norm(lga) : ''

  const candidates = zones.filter((z) => z.isActive)

  if (lgaLc) {
    const lgaMatch = candidates
      .filter((z) => z.lgas.length > 0 && z.lgas.some((l) => norm(l) === lgaLc))
      .sort((a, b) => a.priority - b.priority)[0]
    if (lgaMatch) return lgaMatch
  }

  if (cityLc) {
    const cityMatch = candidates
      .filter((z) => z.cities.some((c) => norm(c) === cityLc))
      .sort((a, b) => a.priority - b.priority)[0]
    if (cityMatch) return cityMatch
  }

  if (stateLc) {
    const stateMatch = candidates
      .filter((z) => z.states.some((s) => norm(s) === stateLc))
      .sort((a, b) => a.priority - b.priority)[0]
    if (stateMatch) return stateMatch
  }

  return null
}

export async function calculateShippingFee(state: string, city: string, lga = '') {
  const zones = await loadShippingZones()
  const match = matchZone(zones, state, city, lga)
  if (match) {
    return { zoneId: match.id, zone: match.name, fee: match.fee, matched: true as const }
  }
  return {
    zoneId: null,
    zone: DEFAULT_SHIPPING_ZONE_LABEL,
    fee: DEFAULT_SHIPPING_FEE,
    matched: false as const,
  }
}

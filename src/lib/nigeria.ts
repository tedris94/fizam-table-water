/**
 * Nigerian states with their general postcodes (per NIPOST).
 * `code` matches what we use throughout the app (e.g. shipping-zones `states` array).
 */
export type NigerianState = {
  name: string
  postcode: string
}

export const NIGERIAN_STATES: NigerianState[] = [
  { name: 'Abia', postcode: '440001' },
  { name: 'Adamawa', postcode: '640001' },
  { name: 'Akwa Ibom', postcode: '520001' },
  { name: 'Anambra', postcode: '420001' },
  { name: 'Bauchi', postcode: '740001' },
  { name: 'Bayelsa', postcode: '561001' },
  { name: 'Benue', postcode: '970001' },
  { name: 'Borno', postcode: '600001' },
  { name: 'Cross River', postcode: '540001' },
  { name: 'Delta', postcode: '320001' },
  { name: 'Ebonyi', postcode: '480001' },
  { name: 'Edo', postcode: '300001' },
  { name: 'Ekiti', postcode: '360001' },
  { name: 'Enugu', postcode: '400001' },
  { name: 'FCT (Abuja)', postcode: '900001' },
  { name: 'Gombe', postcode: '760001' },
  { name: 'Imo', postcode: '460001' },
  { name: 'Jigawa', postcode: '720001' },
  { name: 'Kaduna', postcode: '700001' },
  { name: 'Kano', postcode: '800001' },
  { name: 'Katsina', postcode: '820001' },
  { name: 'Kebbi', postcode: '860001' },
  { name: 'Kogi', postcode: '260001' },
  { name: 'Kwara', postcode: '240001' },
  { name: 'Lagos', postcode: '100001' },
  { name: 'Nasarawa', postcode: '962001' },
  { name: 'Niger', postcode: '920001' },
  { name: 'Ogun', postcode: '110001' },
  { name: 'Ondo', postcode: '340001' },
  { name: 'Osun', postcode: '230001' },
  { name: 'Oyo', postcode: '200001' },
  { name: 'Plateau', postcode: '930001' },
  { name: 'Rivers', postcode: '500001' },
  { name: 'Sokoto', postcode: '840001' },
  { name: 'Taraba', postcode: '660001' },
  { name: 'Yobe', postcode: '620001' },
  { name: 'Zamfara', postcode: '880001' },
]

const POSTCODE_BY_STATE = new Map(
  NIGERIAN_STATES.flatMap((s) => {
    const keys = [s.name.toLowerCase()]
    // also match "Abuja" / "FCT" as aliases for FCT (Abuja)
    if (s.name === 'FCT (Abuja)') keys.push('fct', 'abuja', 'federal capital territory')
    return keys.map((k) => [k, s.postcode] as const)
  }),
)

export function postcodeForState(stateName: string): string | null {
  if (!stateName) return null
  return POSTCODE_BY_STATE.get(stateName.trim().toLowerCase()) ?? null
}

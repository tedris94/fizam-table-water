import data from '@/data/nigeria-states-lgas.json'

type StateRow = { state: string; lgas: string[]; senatorial_districts?: string[] }

const rows = data as StateRow[]

function normKey(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[’']/g, "'")
}

/**
 * Map UI state labels (from `NIGERIAN_STATES`) to rows in the LGAs dataset.
 */
function resolveRow(stateName: string): StateRow | undefined {
  const n = normKey(stateName)
  if (!n) return undefined

  if (n.includes('fct') || n === 'abuja' || n.includes('federal capital')) {
    return rows.find((r) => normKey(r.state) === 'federal capital territory')
  }

  let row = rows.find((r) => normKey(r.state) === n)
  if (row) return row

  if (n === 'nasarawa') {
    row = rows.find((r) => normKey(r.state).includes('nassarawa'))
    if (row) return row
  }

  return undefined
}

/** Local Government Areas for a Nigerian state (official list), sorted A–Z. */
export function getLgasForState(stateName: string): string[] {
  const row = resolveRow(stateName)
  if (!row?.lgas?.length) return []
  return [...row.lgas].sort((a, b) => a.localeCompare(b, 'en'))
}

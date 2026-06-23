/** Extract searchable plain text from Payload Lexical rich text JSON. */
export function lexicalToPlainText(value: unknown): string {
  if (!value) return ''
  const parts: string[] = []

  function walk(node: unknown) {
    if (!node) return
    if (typeof node === 'string') {
      parts.push(node)
      return
    }
    if (typeof node !== 'object') return

    const obj = node as Record<string, unknown>
    if (typeof obj.text === 'string') parts.push(obj.text)

    if (Array.isArray(obj.children)) {
      for (const child of obj.children) walk(child)
    }
    if (obj.root) walk(obj.root)
  }

  walk(value)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

export function matchesSearchQuery(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return false
  return haystack.toLowerCase().includes(q)
}

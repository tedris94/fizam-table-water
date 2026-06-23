/** Extract unique `{{token}}` placeholders from the variables help string. */
export function parsePlaceholderTokens(variablesHelp: string): string[] {
  const seen = new Set<string>()
  const tokens: string[] = []
  for (const match of variablesHelp.matchAll(/\{\{(\w+)\}\}/g)) {
    const token = `{{${match[1]}}}`
    if (!seen.has(token)) {
      seen.add(token)
      tokens.push(token)
    }
  }
  return tokens
}

/** Rough plain-text version for the text/plain email part. */
export function htmlToPlainText(html: string): string {
  if (typeof document !== 'undefined') {
    const div = document.createElement('div')
    div.innerHTML = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
    return (div.textContent || div.innerText || '').replace(/\n{3,}/g, '\n\n').trim()
  }
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

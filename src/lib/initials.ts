/** First letters of each word, up to 2 characters (e.g. "John Adeyemi" → "JA"). */
export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

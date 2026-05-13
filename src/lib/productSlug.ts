/**
 * Stable slug used for in-page anchors:
 *   <a href="/order#product-table-water-50cl">  →  <div id="product-table-water-50cl" />
 *
 * Computed identically on the home (`Products.tsx`) and order (`OrderCheckout.tsx`)
 * sides so a card on either page can reveal/highlight the matching one elsewhere.
 */
export function productSlug(name: string, size: string | null | undefined): string {
  const slug = `${name} ${size ?? ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `product-${slug}`
}

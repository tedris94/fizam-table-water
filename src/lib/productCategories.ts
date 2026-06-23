export const PRODUCT_CATEGORIES = [
  { value: 'table_water', label: 'Table Water', sizes: ['35cl', '50cl', '75cl'] },
  { value: 'sachet_water', label: 'Sachet Water', sizes: ['50cl'] },
  { value: 'dispenser', label: 'Dispenser', sizes: ['19L'] },
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]['value']

export function categoryLabel(category: ProductCategory): string {
  return PRODUCT_CATEGORIES.find((c) => c.value === category)?.label ?? category
}

export function sizesForCategory(category: ProductCategory): readonly string[] {
  return PRODUCT_CATEGORIES.find((c) => c.value === category)?.sizes ?? []
}

export function isValidProductCategory(value: string): value is ProductCategory {
  return PRODUCT_CATEGORIES.some((c) => c.value === value)
}

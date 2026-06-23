import { PRODUCT_CATEGORIES } from '@/lib/productCategories'
import { getPayloadSingleton } from '@/lib/payload'

export type TaxonomyCategory = {
  id: number | string
  slug: string
  label: string
  sortOrder: number
  isActive: boolean
}

export type TaxonomySize = {
  id: number | string
  label: string
  categorySlug: string
  sortOrder: number
  isActive: boolean
}

export type TaxonomyTag = {
  id: number | string
  slug: string
  label: string
  sortOrder: number
  isActive: boolean
}

export type ProductTaxonomy = {
  categories: TaxonomyCategory[]
  sizes: TaxonomySize[]
  tags: TaxonomyTag[]
}

const FALLBACK: ProductTaxonomy = {
  categories: PRODUCT_CATEGORIES.map((c, i) => ({
    id: c.value,
    slug: c.value,
    label: c.label,
    sortOrder: (i + 1) * 10,
    isActive: true,
  })),
  sizes: PRODUCT_CATEGORIES.flatMap((c, ci) =>
    c.sizes.map((label, si) => ({
      id: `${c.value}-${label}`,
      label,
      categorySlug: c.value,
      sortOrder: ci * 10 + si,
      isActive: true,
    })),
  ),
  tags: [],
}

export async function fetchProductTaxonomy(activeOnly = true): Promise<ProductTaxonomy> {
  try {
    const payload = await getPayloadSingleton()
    const whereActive = activeOnly ? ({ isActive: { equals: true } } as const) : undefined

    const [categories, sizes, tags] = await Promise.all([
      payload.find({
        collection: 'product-categories',
        limit: 200,
        sort: 'sortOrder',
        ...(whereActive ? { where: whereActive } : {}),
        overrideAccess: true,
      }),
      payload.find({
        collection: 'product-sizes',
        limit: 500,
        sort: 'sortOrder',
        ...(whereActive ? { where: whereActive } : {}),
        overrideAccess: true,
      }),
      payload.find({
        collection: 'product-tags',
        limit: 200,
        sort: 'sortOrder',
        ...(whereActive ? { where: whereActive } : {}),
        overrideAccess: true,
      }),
    ])

    if (categories.totalDocs === 0) return FALLBACK

    return {
      categories: categories.docs.map((doc) => ({
        id: doc.id,
        slug: doc.slug,
        label: doc.label,
        sortOrder: doc.sortOrder ?? 100,
        isActive: doc.isActive !== false,
      })),
      sizes: sizes.docs.map((doc) => ({
        id: doc.id,
        label: doc.label,
        categorySlug: doc.categorySlug,
        sortOrder: doc.sortOrder ?? 100,
        isActive: doc.isActive !== false,
      })),
      tags: tags.docs.map((doc) => ({
        id: doc.id,
        slug: doc.slug,
        label: doc.label,
        sortOrder: doc.sortOrder ?? 100,
        isActive: doc.isActive !== false,
      })),
    }
  } catch {
    return FALLBACK
  }
}

export function categoryLabelFromTaxonomy(
  taxonomy: ProductTaxonomy,
  slug: string,
): string {
  return taxonomy.categories.find((c) => c.slug === slug)?.label ?? slug
}

export function sizesForCategoryFromTaxonomy(
  taxonomy: ProductTaxonomy,
  categorySlug: string,
): string[] {
  return taxonomy.sizes
    .filter((s) => s.categorySlug === categorySlug)
    .map((s) => s.label)
}

export async function isValidCategorySlug(slug: string): Promise<boolean> {
  const taxonomy = await fetchProductTaxonomy(false)
  return taxonomy.categories.some((c) => c.slug === slug)
}

export async function isValidSizeForCategory(
  categorySlug: string,
  sizeLabel: string,
): Promise<boolean> {
  const taxonomy = await fetchProductTaxonomy(false)
  return taxonomy.sizes.some(
    (s) => s.categorySlug === categorySlug && s.label === sizeLabel,
  )
}

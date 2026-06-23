'use client'

import { useEffect, useState } from 'react'
import {
  TaxonomyManagerView,
  Field,
  TextInput,
  NumberInput,
  ActiveCheckbox,
} from './TaxonomyManagerView'

type Size = {
  id: number | string
  label: string
  categorySlug: string
  sortOrder: number
  isActive: boolean
}

type Category = { slug: string; label: string }

export function ProductSizesView({ role }: { role: string }) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    void fetch('/api/product-taxonomy')
      .then((r) => r.json())
      .then((data: { categories?: Category[] }) => setCategories(data.categories ?? []))
      .catch(() => setCategories([]))
  }, [])

  return (
    <TaxonomyManagerView<Size>
      role={role}
      title="Product Sizes"
      description="Sizes are grouped by category and used when adding or editing products."
      apiBase="/api/admin/product-sizes"
      emptyLabel="No sizes yet. Add sizes for each category."
      renderRow={(item) => (
        <div>
          <div className="font-semibold text-[#1a1f71]">{item.label}</div>
          <div className="text-xs text-gray-500">
            category: {item.categorySlug} · order: {item.sortOrder} ·{' '}
            {item.isActive ? 'active' : 'inactive'}
          </div>
        </div>
      )}
      buildForm={(item) => ({
        label: item?.label ?? '',
        categorySlug: item?.categorySlug ?? categories[0]?.slug ?? '',
        sortOrder: item?.sortOrder ?? 100,
        isActive: item?.isActive !== false,
      })}
      validate={(form) => {
        if (!String(form.label ?? '').trim()) return 'Size label is required.'
        if (!String(form.categorySlug ?? '').trim()) return 'Category is required.'
        return null
      }}
      renderFields={(form, setForm) => (
        <>
          <Field label="Category *">
            <select
              value={String(form.categorySlug ?? '')}
              onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-[#2563eb] focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Size label *">
            <TextInput
              value={String(form.label ?? '')}
              onChange={(label) => setForm({ ...form, label })}
              placeholder="e.g. 50cl"
            />
          </Field>
          <Field label="Sort order">
            <NumberInput
              value={Number(form.sortOrder ?? 100)}
              onChange={(sortOrder) => setForm({ ...form, sortOrder })}
            />
          </Field>
          <ActiveCheckbox
            checked={form.isActive !== false}
            onChange={(isActive) => setForm({ ...form, isActive })}
          />
        </>
      )}
    />
  )
}

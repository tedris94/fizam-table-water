'use client'

import {
  TaxonomyManagerView,
  Field,
  TextInput,
  NumberInput,
  ActiveCheckbox,
} from './TaxonomyManagerView'

type Tag = {
  id: number | string
  slug: string
  label: string
  sortOrder: number
  isActive: boolean
}

export function ProductTagsView({ role }: { role: string }) {
  return (
    <TaxonomyManagerView<Tag>
      role={role}
      title="Product Tags"
      description="Tags help with product search and filtering on the order page."
      apiBase="/api/admin/product-tags"
      emptyLabel="No tags yet. Add tags like bestseller, new, or promo."
      renderRow={(item) => (
        <div>
          <div className="font-semibold text-[#1a1f71]">{item.label}</div>
          <div className="text-xs text-gray-500">
            slug: {item.slug} · order: {item.sortOrder} ·{' '}
            {item.isActive ? 'active' : 'inactive'}
          </div>
        </div>
      )}
      buildForm={(item) => ({
        label: item?.label ?? '',
        slug: item?.slug ?? '',
        sortOrder: item?.sortOrder ?? 100,
        isActive: item?.isActive !== false,
      })}
      validate={(form) => {
        if (!String(form.label ?? '').trim()) return 'Label is required.'
        return null
      }}
      renderFields={(form, setForm) => (
        <>
          <Field label="Label *">
            <TextInput
              value={String(form.label ?? '')}
              onChange={(label) => setForm({ ...form, label })}
            />
          </Field>
          <Field label="Slug (optional)">
            <TextInput
              value={String(form.slug ?? '')}
              onChange={(slug) => setForm({ ...form, slug })}
              placeholder="auto-generated from label"
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

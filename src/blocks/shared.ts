import type { Field } from 'payload'

/** Icon names available to content editors. Mapped to lucide icons in the renderer. */
export const ICON_OPTIONS = [
  { label: 'Droplets', value: 'droplets' },
  { label: 'Flask', value: 'flask' },
  { label: 'Award', value: 'award' },
  { label: 'File check', value: 'fileCheck' },
  { label: 'Check circle', value: 'checkCircle' },
  { label: 'Shield', value: 'shield' },
  { label: 'Sparkles', value: 'sparkles' },
  { label: 'Store', value: 'store' },
  { label: 'Warehouse', value: 'warehouse' },
  { label: 'Factory', value: 'factory' },
  { label: 'Truck', value: 'truck' },
  { label: 'Phone', value: 'phone' },
  { label: 'Mail', value: 'mail' },
  { label: 'Map pin', value: 'mapPin' },
  { label: 'Clock', value: 'clock' },
  { label: 'Star', value: 'star' },
  { label: 'Heart', value: 'heart' },
  { label: 'Package', value: 'package' },
  { label: 'Users', value: 'users' },
  { label: 'Leaf', value: 'leaf' },
  { label: 'Zap', value: 'zap' },
  { label: 'Globe', value: 'globe' },
] as const

export const iconSelect = (name = 'icon', label = 'Icon'): Field => ({
  name,
  label,
  type: 'select',
  options: [...ICON_OPTIONS],
})

/** A simple {label, href} call-to-action group. */
export const ctaGroup = (name: string, label: string): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    { name: 'label', type: 'text' },
    { name: 'href', type: 'text', admin: { description: 'e.g. /order or https://…' } },
  ],
})

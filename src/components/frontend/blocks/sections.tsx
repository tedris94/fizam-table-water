import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { getIcon } from './icons'

type Cta = { label?: string | null; href?: string | null } | null | undefined

export function PageHeaderSection({
  icon,
  title,
  subtitle,
  align = 'center',
  showBreadcrumb = false,
}: {
  icon?: string | null
  title?: string | null
  subtitle?: string | null
  align?: string | null
  showBreadcrumb?: boolean | null
}) {
  if (align === 'left') {
    return (
      <section className="border-b border-blue-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto max-w-4xl px-4 py-10 md:py-14">
          {showBreadcrumb && (
            <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="text-[#2563eb] hover:underline">
                    Home
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="font-medium text-gray-700">{title}</li>
              </ol>
            </nav>
          )}
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#1a1f71] md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-6 text-lg font-medium text-[#2563eb]">{subtitle}</p>}
        </div>
      </section>
    )
  }

  const Icon = icon ? getIcon(icon) : null
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white pt-12 pb-8 md:pt-16">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        {Icon && (
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] rounded-full mb-6">
            <Icon className="w-8 h-8 text-white" />
          </div>
        )}
        <h1 className="text-4xl md:text-5xl text-[#1a1f71] mb-4">{title}</h1>
        {subtitle && <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  )
}

export function ImageTextSection({
  heading,
  body,
  imageUrl,
  imagePosition = 'right',
  cta,
}: {
  heading?: string | null
  body?: string | null
  imageUrl?: string | null
  imagePosition?: string | null
  cta?: Cta
}) {
  // No image → render the lightweight "About" band (matches the home About FIZAM section).
  if (!imageUrl) {
    return (
      <section className="border-b border-blue-100 bg-gradient-to-b from-white to-slate-50 py-12 md:py-16">
        <div className="container mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 px-4 md:flex-row md:items-center">
          <div className="text-center md:text-left">
            {heading && <h2 className="text-2xl font-bold text-[#1a1f71] md:text-3xl">{heading}</h2>}
            {body && <p className="mt-3 max-w-xl whitespace-pre-line text-gray-600">{body}</p>}
          </div>
          {cta?.label && (
            <a
              href={cta.href || '#'}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#1a1f71] to-[#2563eb] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              {cta.label}
            </a>
          )}
        </div>
      </section>
    )
  }

  const imageLeft = imagePosition === 'left'
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className={imageLeft ? 'md:order-2' : ''}>
            {heading && <h2 className="text-3xl md:text-4xl text-[#1a1f71] mb-4">{heading}</h2>}
            {body && <p className="text-lg text-gray-600 whitespace-pre-line mb-6">{body}</p>}
            {cta?.label && (
              <a
                href={cta.href || '#'}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#1a1f71] to-[#2563eb] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              >
                {cta.label}
              </a>
            )}
          </div>
          <div className={imageLeft ? 'md:order-1' : ''}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl">
              <Image src={imageUrl} alt={heading || 'Section image'} fill className="object-cover" sizes="(max-width: 768px) 90vw, 600px" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function CtaBannerSection({
  heading,
  body,
  buttons,
}: {
  heading?: string | null
  body?: string | null
  buttons?: { label: string; href?: string | null; style?: string | null }[] | null
}) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-[#1a1f71] via-[#2563eb] to-[#0ea5e9] rounded-3xl p-12 text-center text-white">
          {heading && <h3 className="text-3xl md:text-4xl mb-4">{heading}</h3>}
          {body && <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">{body}</p>}
          {buttons && buttons.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center">
              {buttons.map((btn, index) =>
                btn.style === 'outline' ? (
                  <a
                    key={index}
                    href={btn.href || '#'}
                    className="bg-transparent border-2 border-white px-8 py-3 rounded-full hover:bg-white/10 transition-colors inline-block"
                  >
                    {btn.label}
                  </a>
                ) : (
                  <a
                    key={index}
                    href={btn.href || '#'}
                    className="bg-white text-[#1a1f71] px-8 py-3 rounded-full hover:bg-blue-50 transition-colors inline-block"
                  >
                    {btn.label}
                  </a>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

const COLUMN_CLASS: Record<string, string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'md:grid-cols-2 lg:grid-cols-4',
}

export function FeatureGridSection({
  heading,
  subheading,
  columns = '4',
  features,
}: {
  heading?: string | null
  subheading?: string | null
  columns?: string | null
  features?: { icon?: string | null; title: string; description?: string | null }[] | null
}) {
  const gridCols = COLUMN_CLASS[columns ?? '4'] ?? COLUMN_CLASS['4']
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {(heading || subheading) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-[#1a1f71] mb-4">{heading}</h2>}
            {subheading && <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subheading}</p>}
          </div>
        )}
        <div className={`grid gap-6 ${gridCols}`}>
          {(features ?? []).map((feature, index) => {
            const Icon = getIcon(feature.icon)
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#1a1f71] to-[#2563eb] rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl text-[#1a1f71] mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const RICH_TEXT_PROSE =
  'space-y-4 leading-relaxed text-gray-700 [&_a]:text-[#2563eb] [&_a]:underline [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[#1a1f71] [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#1a1f71] [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6'

export function RichTextSection({
  content,
  variant = 'prose',
}: {
  content?: SerializedEditorState | null
  variant?: string | null
}) {
  if (!content) return null

  if (variant === 'card') {
    return (
      <section className="bg-gradient-to-b from-gray-50 to-white pb-16 pt-4">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className={`rounded-2xl bg-white p-8 shadow-lg md:p-12 [&>*+*]:mt-8 ${RICH_TEXT_PROSE}`}>
            <RichText data={content} />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className={RICH_TEXT_PROSE}>
          <RichText data={content} />
        </div>
      </div>
    </section>
  )
}

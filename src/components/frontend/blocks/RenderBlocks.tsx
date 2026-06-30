import { ReactNode } from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { resolveMediaFromDoc } from '@/lib/mediaUrl'
import { Hero } from '@/components/frontend/Hero'
import { Products } from '@/components/frontend/Products'
import { Quality } from '@/components/frontend/Quality'
import { SalesChannels } from '@/components/frontend/SalesChannels'
import { Contact } from '@/components/frontend/Contact'
import {
  PageHeaderSection,
  ImageTextSection,
  CtaBannerSection,
  FeatureGridSection,
  RichTextSection,
} from '@/components/frontend/blocks/sections'

type BlockData = { blockType?: string; id?: string | null; [key: string]: unknown }

type RenderBlocksProps = {
  blocks?: BlockData[] | null
  /** Header node embedded transparently inside the first hero block (home page). */
  heroHeader?: ReactNode
  /** Show the search box inside the first hero block (home page). */
  heroShowSearch?: boolean
}

function img(value: unknown): string | null {
  if (value && typeof value === 'object') {
    return resolveMediaFromDoc(value as { url?: string | null; filename?: string | null })
  }
  return null
}

export function RenderBlocks({ blocks, heroHeader, heroShowSearch }: RenderBlocksProps) {
  if (!blocks || blocks.length === 0) return null
  let heroSeen = false

  return (
    <>
      {blocks.map((block, index) => {
        const key = block.id ? String(block.id) : `${block.blockType}-${index}`
        switch (block.blockType) {
          case 'pageHeader':
            return (
              <PageHeaderSection
                key={key}
                icon={block.icon as string | null}
                title={block.title as string | null}
                subtitle={block.subtitle as string | null}
                align={block.align as string | null}
                showBreadcrumb={block.showBreadcrumb as boolean | null}
              />
            )
          case 'hero': {
            const isFirstHero = !heroSeen
            heroSeen = true
            return (
              <Hero
                key={key}
                badge={block.badge as string | null}
                heroTitle={block.title as string | null}
                heroSubtitle={block.subtitle as string | null}
                heroImageUrl={img(block.image)}
                primaryCta={block.primaryCta as { label?: string | null; href?: string | null } | null}
                secondaryCta={block.secondaryCta as { label?: string | null; href?: string | null } | null}
                header={isFirstHero ? heroHeader : undefined}
                showSearch={isFirstHero ? heroShowSearch : false}
              />
            )
          }
          case 'imageText':
            return (
              <ImageTextSection
                key={key}
                heading={block.heading as string | null}
                body={block.body as string | null}
                imageUrl={img(block.image)}
                imagePosition={block.imagePosition as string | null}
                cta={block.cta as { label?: string | null; href?: string | null } | null}
              />
            )
          case 'products':
            return (
              <Products
                key={key}
                heading={block.heading as string | null}
                subheading={block.subheading as string | null}
                items={block.items as never}
                bannerHeading={block.bannerHeading as string | null}
                bannerBody={block.bannerBody as string | null}
              />
            )
          case 'quality':
            return (
              <Quality
                key={key}
                badge={block.badge as string | null}
                heading={block.heading as string | null}
                subheading={block.subheading as string | null}
                certifications={block.certifications as never}
                processHeading={block.processHeading as string | null}
                steps={block.steps as never}
                guaranteeTitle={block.guaranteeTitle as string | null}
                guaranteeBody={block.guaranteeBody as string | null}
                statValue={block.statValue as string | null}
                statLabel={block.statLabel as string | null}
              />
            )
          case 'salesChannels':
            return (
              <SalesChannels
                key={key}
                heading={block.heading as string | null}
                subheading={block.subheading as string | null}
                channels={block.channels as never}
                ctaHeading={block.ctaHeading as string | null}
                ctaBody={block.ctaBody as string | null}
                primaryCta={block.primaryCta as { label?: string | null; href?: string | null } | null}
                secondaryCta={block.secondaryCta as { label?: string | null; href?: string | null } | null}
              />
            )
          case 'contact':
            return (
              <Contact
                key={key}
                heading={block.heading as string | null}
                subheading={block.subheading as string | null}
                phone={block.phone as string | null}
                phoneHref={block.phoneHref as string | null}
                email={block.email as string | null}
                address={block.address as string | null}
                hours={block.hours as string | null}
                whyTitle={block.whyTitle as string | null}
                whyItems={block.whyItems as never}
              />
            )
          case 'featureGrid':
            return (
              <FeatureGridSection
                key={key}
                heading={block.heading as string | null}
                subheading={block.subheading as string | null}
                columns={block.columns as string | null}
                features={block.features as never}
              />
            )
          case 'ctaBanner':
            return (
              <CtaBannerSection
                key={key}
                heading={block.heading as string | null}
                body={block.body as string | null}
                buttons={block.buttons as never}
              />
            )
          case 'richText':
            return (
              <RichTextSection
                key={key}
                content={block.content as SerializedEditorState | null}
                variant={block.variant as string | null}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}

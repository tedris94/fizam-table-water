/**
 * Generates WhatsApp/social-friendly assets:
 * - og-image.jpg 1200×630, < 600 KB, full artwork (no crop) + CTA bar
 * - favicon + apple-touch-icon sizes
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const imagesDir = path.join(root, 'public', 'images')
const appDir = path.join(root, 'src', 'app')
const sourceOg = path.join(imagesDir, 'og-image.png')
const sourceLogo = path.join(imagesDir, 'logo.png')

const OG_WIDTH = 1200
const OG_HEIGHT = 630
const CTA_HEIGHT = 72
const BRAND_BG = { r: 240, g: 247, b: 255 }

function ctaOverlaySvg() {
  return Buffer.from(`<svg width="${OG_WIDTH}" height="${CTA_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1a1f71"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
    font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="700" fill="#ffffff">
    Order Now at fizam.ng →
  </text>
</svg>`)
}

async function writeOgJpeg() {
  const out = path.join(imagesDir, 'og-image.jpg')
  const artHeight = OG_HEIGHT - CTA_HEIGHT

  let quality = 88
  for (let attempt = 0; attempt < 6; attempt++) {
    const artwork = await sharp(sourceOg)
      .resize(OG_WIDTH, artHeight, {
        fit: 'contain',
        background: BRAND_BG,
      })
      .png()
      .toBuffer()

    await sharp({
      create: {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        channels: 3,
        background: BRAND_BG,
      },
    })
      .composite([
        { input: artwork, top: 0, left: 0 },
        { input: ctaOverlaySvg(), top: artHeight, left: 0 },
      ])
      .jpeg({ quality, mozjpeg: true })
      .toFile(out)

    const size = fs.statSync(out).size
    if (size <= 580_000) {
      console.log(`og-image.jpg: ${size} bytes @ quality ${quality} (contain + CTA)`)
      return
    }
    quality -= 8
  }
  console.warn('og-image.jpg may still exceed 600 KB — lower quality manually if needed')
}

async function writeLogoVariant(size, outPath, padding = 0.12) {
  const canvas = Math.round(size * (1 + padding))
  const inner = Math.round(size * (1 - padding * 0.5))
  const logo = await sharp(sourceLogo).resize(inner, inner, { fit: 'inside' }).png().toBuffer()
  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .resize(size, size)
    .png()
    .toFile(outPath)
  console.log(`${path.basename(outPath)}: ${fs.statSync(outPath).size} bytes`)
}

async function main() {
  if (!fs.existsSync(sourceOg)) throw new Error(`Missing ${sourceOg}`)
  if (!fs.existsSync(sourceLogo)) throw new Error(`Missing ${sourceLogo}`)

  await writeOgJpeg()
  await writeLogoVariant(32, path.join(imagesDir, 'favicon-32.png'), 0.08)
  await writeLogoVariant(192, path.join(imagesDir, 'favicon-192.png'))
  await writeLogoVariant(180, path.join(imagesDir, 'apple-touch-icon.png'))
  await writeLogoVariant(32, path.join(appDir, 'icon.png'), 0.08)
  await writeLogoVariant(180, path.join(appDir, 'apple-icon.png'))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

/**
 * Generates WhatsApp/social-friendly assets:
 * - og-image.jpg 1200×630, < 600 KB
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

async function writeOgJpeg() {
  const out = path.join(imagesDir, 'og-image.jpg')
  let quality = 85
  for (let attempt = 0; attempt < 6; attempt++) {
    await sharp(sourceOg)
      .resize(1200, 630, { fit: 'cover', position: 'centre' })
      .jpeg({ quality, mozjpeg: true })
      .toFile(out)
    const size = fs.statSync(out).size
    if (size <= 580_000) {
      console.log(`og-image.jpg: ${size} bytes @ quality ${quality}`)
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

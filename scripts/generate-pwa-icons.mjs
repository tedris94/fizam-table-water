/**
 * Regenerate PWA / favicon assets from the official Fizam logo.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const logoPath = path.join(root, 'public/images/logo.png')
const outDir = path.join(root, 'public/images')

/** White canvas with the logo centered; `scale` is fraction of canvas width. */
async function iconPng(size, scale, filename) {
  const logo = sharp(logoPath).resize(Math.round(size * scale), null, { fit: 'inside' })
  const { data, info } = await logo.ensureAlpha().raw().toBuffer({ resolveWithObject: true })

  const left = Math.round((size - info.width) / 2)
  const top = Math.round((size - info.height) / 2)

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: data, raw: { width: info.width, height: info.height, channels: 4 }, left, top }])
    .png()
    .toFile(path.join(outDir, filename))

  console.log(`  wrote ${filename} (${size}x${size})`)
}

async function main() {
  console.log('Generating PWA icons from public/images/logo.png ...')
  await iconPng(32, 0.88, 'favicon-32.png')
  await iconPng(180, 0.82, 'apple-touch-icon.png')
  await iconPng(192, 0.82, 'favicon-192.png')
  await iconPng(512, 0.72, 'pwa-icon-512.png')

  const png = await sharp(path.join(outDir, 'pwa-icon-512.png')).toBuffer()
  const b64 = png.toString('base64')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><image href="data:image/png;base64,${b64}" width="512" height="512"/></svg>`
  const iconSvg = path.join(root, 'public/icon.svg')
  await fs.promises.writeFile(iconSvg, svg)
  console.log(`  wrote public/icon.svg (from logo)`)

  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

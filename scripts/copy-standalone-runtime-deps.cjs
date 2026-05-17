/**
 * Copy production runtime dependencies into .next/standalone/node_modules.
 * pnpm + Next standalone tracing omit nested packages; BFS copy from seeds fixes that
 * without merging the entire prod tree (too large for CI zip/rsync).
 */
const fs = require('fs')
const path = require('path')
const { createRequire } = require('module')
const { cpSync } = require('fs')

const root = process.cwd()
const standaloneNm = path.join(root, '.next/standalone/node_modules')

if (!fs.existsSync(path.join(root, '.next/standalone/server.js'))) {
  console.error('error: run standalone build first')
  process.exit(1)
}

const anchors = []
for (const entry of [
  'next/package.json',
  'payload/package.json',
  '@payloadcms/db-sqlite/package.json',
  path.join(root, 'package.json'),
]) {
  try {
    anchors.push(typeof entry === 'string' && entry.startsWith('/') ? entry : require.resolve(entry))
  } catch {}
}

function resolvePkgRoot(name) {
  for (const anchor of anchors) {
    try {
      const req = createRequire(anchor)
      let resolved
      try {
        resolved = req.resolve(`${name}/package.json`)
      } catch {
        resolved = req.resolve(name)
      }
      let dir = path.dirname(resolved)
      while (dir !== path.dirname(dir)) {
        const pkgJson = path.join(dir, 'package.json')
        if (fs.existsSync(pkgJson)) {
          const pkg = JSON.parse(fs.readFileSync(pkgJson, 'utf8'))
          if (pkg.name === name) return dir
        }
        dir = path.dirname(dir)
      }
    } catch {}
  }
  throw new Error(`Cannot resolve package: ${name}`)
}

const seeds = new Set()
try {
  const nextPkg = require(require.resolve('next/package.json'))
  for (const dep of Object.keys(nextPkg.dependencies || {})) seeds.add(dep)
} catch {}

for (const name of [
  'payload',
  '@payloadcms/db-sqlite',
  '@payloadcms/next',
  '@payloadcms/drizzle',
  'graphql',
  'sharp',
  'react',
  'react-dom',
  'drizzle-orm',
  'libsql',
  '@libsql/client',
]) {
  seeds.add(name)
}

const copied = new Set()
const queue = [...seeds]
let count = 0

while (queue.length > 0) {
  const name = queue.shift()
  if (copied.has(name)) continue

  let pkgRoot
  try {
    pkgRoot = resolvePkgRoot(name)
  } catch (err) {
    console.warn(`  skip ${name}: ${err.message}`)
    continue
  }

  const dest = path.join(standaloneNm, name)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.rmSync(dest, { recursive: true, force: true })
  cpSync(pkgRoot, dest, { recursive: true, dereference: true })
  copied.add(name)
  count++
  console.log(`  + ${name}`)

  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'))
  for (const dep of Object.keys(pkg.dependencies || {})) {
    if (!copied.has(dep)) queue.push(dep)
  }
}

console.log(`Copied ${count} packages into standalone node_modules`)

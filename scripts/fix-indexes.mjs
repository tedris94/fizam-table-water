#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * One-shot maintenance script.
 *
 * Payload's SQLite adapter creates new indexes via `CREATE INDEX` (without
 * `IF NOT EXISTS`). When a field referencing a new collection is added (e.g.
 * `Orders.shippingZone`), the index lands fine on the first restart. On the
 * next restart Payload tries to recreate the same index and crashes with:
 *
 *   SQLITE_ERROR: index orders_shipping_zone_idx already exists
 *
 * This script drops every non-PK index in our schema so Payload can rebuild
 * them cleanly. Safe to re-run — indexes are not data.
 *
 * Usage: `pnpm fix-indexes` (stop the dev server first so the DB isn't locked).
 */

import path from 'node:path'
import fs from 'node:fs'
import url from 'node:url'
import { createClient } from '@libsql/client'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dbPath = path.join(root, 'data', 'fizam.db')

if (!fs.existsSync(dbPath)) {
  console.error(`No SQLite file at ${dbPath}. Nothing to fix.`)
  process.exit(0)
}

const client = createClient({ url: `file:${dbPath.replace(/\\/g, '/')}` })

try {
  const result = await client.execute(
    `SELECT name FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL`,
  )
  const indexes = result.rows.map((r) => r.name)

  if (indexes.length === 0) {
    console.log('No drop-able indexes found. Already clean.')
  } else {
    for (const name of indexes) {
      try {
        await client.execute(`DROP INDEX IF EXISTS \`${name}\``)
        console.log(`- dropped ${name}`)
      } catch (e) {
        console.warn(`! could not drop ${name}:`, e.message)
      }
    }
    console.log(
      `\nDropped ${indexes.length} index(es). Payload will recreate them on next start.`,
    )
  }
} finally {
  client.close()
}

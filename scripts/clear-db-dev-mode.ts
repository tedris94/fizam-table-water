/**
 * Clear Payload's dev-mode flag from SQLite database.
 * Prevents interactive migration prompts during builds and CLI runs.
 */
import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

function resolveDatabaseFile(): string {
  const envUri = process.env.DATABASE_URI?.trim()
  if (envUri?.startsWith('file:')) {
    const relative = envUri.slice(5).replace(/^\/\/+/, '')
    return path.isAbsolute(relative) ? relative : path.join(root, relative)
  }
  return path.join(root, 'data', 'fizam.db')
}

async function main() {
  const dbFile = resolveDatabaseFile()

  if (!fs.existsSync(dbFile)) {
    console.log('Database not found (skipping dev-mode clear).')
    process.exit(0)
  }

  const { createClient } = await import('@libsql/client')
  const url = `file:${dbFile.replace(/\\/g, '/')}`
  const client = createClient({ url })

  try {
    await client.execute(
      `DELETE FROM payload_migrations WHERE name = 'dev' AND batch = -1`,
    )
    console.log('Cleared dev-mode migration marker.')
  } finally {
    client.close()
  }

  process.exit(0)
}

main().catch((error) => {
  console.warn('Could not clear dev-mode flag:', error)
  process.exit(0)
})

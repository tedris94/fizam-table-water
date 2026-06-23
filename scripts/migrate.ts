/**
 * Run Payload migrations without interactive prompts.
 * Clears the dev-mode marker (batch -1) before migrating so Payload does not ask for confirmation.
 */
import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

process.chdir(root)
process.env.PAYLOAD_MIGRATING = 'true'

function resolveDatabaseFile(): string {
  const envUri = process.env.DATABASE_URI?.trim()
  if (envUri?.startsWith('file:')) {
    const relative = envUri.slice(5).replace(/^\/\/+/, '')
    return path.isAbsolute(relative) ? relative : path.join(root, relative)
  }
  return path.join(root, 'data', 'fizam.db')
}

async function clearDevModeFlag(dbFile: string): Promise<void> {
  if (!fs.existsSync(dbFile)) {
    console.log('Database not found — skipping dev-mode clear.')
    return
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
}

async function main() {
  const statusOnly = process.argv.includes('--status')
  const dbFile = resolveDatabaseFile()

  await clearDevModeFlag(dbFile)

  const { getPayload } = await import('payload')
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  if (statusOnly) {
    await payload.db.migrateStatus()
  } else {
    await payload.db.migrate()
    console.log('Migrations complete.')
  }

  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

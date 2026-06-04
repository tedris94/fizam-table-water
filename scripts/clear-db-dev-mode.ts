/**
 * Clear Payload's dev-mode flag from SQLite database.
 * This prevents interactive migration prompts during builds.
 */
import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dbPath = path.join(root, 'data', 'fizam.db')

if (!fs.existsSync(dbPath)) {
  console.log('ℹ Database not found at', dbPath, ' (skipping dev-mode clear)')
  process.exit(0)
}

try {
  // Use sqlite3 CLI to delete the dev-mode migration marker
  const cmd = `sqlite3 "${dbPath}" "DELETE FROM payload_migrations WHERE name = 'dev' AND batch = -1;"`
  const result = execSync(cmd, { encoding: 'utf8' })
  
  console.log('✓ Cleared dev-mode flag from database')
  process.exit(0)
} catch (err: any) {
  // sqlite3 may not be available on all systems; this is non-critical
  console.warn('ℹ Could not clear dev-mode flag (sqlite3 CLI may not be available)')
  console.warn('  This is non-critical; the migrations step should have handled it.')
  process.exit(0)
}

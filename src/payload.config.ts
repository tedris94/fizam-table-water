import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { migrations } from './migrations'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { ProductCategories } from './collections/ProductCategories'
import { ProductSizes } from './collections/ProductSizes'
import { ProductTags } from './collections/ProductTags'
import { Orders } from './collections/Orders'
import { TeamMembers } from './collections/TeamMembers'
import { Jobs } from './collections/Jobs'
import { Applications } from './collections/Applications'
import { Pages } from './collections/Pages'
import { ShippingZones } from './collections/ShippingZones'
import { EmailTemplates } from './collections/EmailTemplates'
import { DashboardRoles } from './collections/DashboardRoles'
import { AnalyticsEvents } from './collections/AnalyticsEvents'
import { AuditLogs } from './collections/AuditLogs'
import { SiteSettings } from './globals/SiteSettings'
import { HomePage } from './globals/HomePage'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { withAudit, withGlobalAudit } from './lib/audit'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Determine database path - gracefully handle missing DB for frontend-only deployments
const databaseDir = path.resolve(process.cwd(), 'data')
const databaseFile = path.join(databaseDir, 'fizam.db')
const envDatabaseUri = process.env.DATABASE_URI

const isLocalFileUri = (uri: string) => {
  if (!uri.startsWith('file:')) return false
  const pathPart = uri.slice(5)
  return !path.isAbsolute(pathPart.replace(/^(\/\/|\\\\)/, ''))
}

// On Vercel: use temp directory for SQLite since /data is ephemeral
const useTmpDatabase =
  process.env.VERCEL === '1' && envDatabaseUri && isLocalFileUri(envDatabaseUri)

const runtimeDatabaseFile = useTmpDatabase
  ? path.join(process.env.TMPDIR || '/tmp', 'fizam.db')
  : databaseFile

// Ensure database directory exists
if (process.env.VERCEL === '1') {
  const runtimeDatabaseDir = path.dirname(runtimeDatabaseFile)
  try {
    if (!fs.existsSync(runtimeDatabaseDir)) {
      fs.mkdirSync(runtimeDatabaseDir, { recursive: true })
    }
    // Try to copy seed database if available
    if (!fs.existsSync(runtimeDatabaseFile) && fs.existsSync(databaseFile)) {
      fs.copyFileSync(databaseFile, runtimeDatabaseFile)
    }
  } catch (e) {
    console.warn('Could not set up Vercel temp database:', e)
  }
} else {
  // Ensure data directory exists locally
  if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, { recursive: true })
  }
}

// Build SQLite URL - fallback to temp if needed
const sqliteUrl =
  envDatabaseUri && !useTmpDatabase
    ? envDatabaseUri
    : `file:${runtimeDatabaseFile.replace(/\\/g, '/')}`

const serverURL =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.PAYLOAD_PUBLIC_SERVER_URL ||
      'https://fizam.ng'
    : process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** Local dev origins — Payload CSRF only trusts `serverURL` by default. */
const localDevCsrfOrigins =
  process.env.NODE_ENV !== 'production'
    ? ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001']
    : []

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'CHANGE_ME_DEV_ONLY',
  serverURL,
  csrf: localDevCsrfOrigins,
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Fizam CMS',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    // Wrap data collections with the audit trail. AnalyticsEvents and AuditLogs
    // are intentionally excluded to avoid recursive/noisy logging.
    withAudit(Users),
    withAudit(Media),
    withAudit(ProductCategories),
    withAudit(ProductSizes),
    withAudit(ProductTags),
    withAudit(Products),
    withAudit(Orders),
    withAudit(TeamMembers),
    withAudit(Jobs),
    withAudit(Applications),
    withAudit(Pages),
    withAudit(ShippingZones),
    withAudit(EmailTemplates),
    withAudit(DashboardRoles),
    AnalyticsEvents,
    AuditLogs,
  ],
  globals: [
    withGlobalAudit(SiteSettings),
    withGlobalAudit(HomePage),
    withGlobalAudit(Header),
    withGlobalAudit(Footer),
  ],
  editor: lexicalEditor({}),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: sqliteUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
    wal: true,
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations,
  }),
  sharp,
})

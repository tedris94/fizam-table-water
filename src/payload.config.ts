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
import { Orders } from './collections/Orders'
import { TeamMembers } from './collections/TeamMembers'
import { Jobs } from './collections/Jobs'
import { Applications } from './collections/Applications'
import { Pages } from './collections/Pages'
import { ShippingZones } from './collections/ShippingZones'
import { SiteSettings } from './globals/SiteSettings'
import { HomePage } from './globals/HomePage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const databaseDir = path.resolve(process.cwd(), 'data')
if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, { recursive: true })
}

const databaseFile = path.join(databaseDir, 'fizam.db')
const sqliteUrl =
  process.env.DATABASE_URI ??
  `file:${databaseFile.replace(/\\/g, '/')}`

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'CHANGE_ME_DEV_ONLY',
  serverURL:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    'http://localhost:3000',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Fizam CMS',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Products, Orders, TeamMembers, Jobs, Applications, Pages, ShippingZones],
  globals: [SiteSettings, HomePage],
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

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { authorizeCapability } from '@/lib/dashboardAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Resolve the SQLite database file the same way payload.config.ts does. */
function resolveDbFile(): string {
  const envUri = process.env.DATABASE_URI?.trim()
  if (envUri && envUri.startsWith('file:')) {
    return envUri.replace(/^file:/, '')
  }
  return path.join(process.cwd(), 'data', 'fizam.db')
}

export async function GET(request: Request) {
  const auth = await authorizeCapability(request, 'system.backup')
  if (!auth.ok) return auth.response

  try {
    const dbFile = resolveDbFile()
    if (!fs.existsSync(dbFile)) {
      return NextResponse.json({ error: 'Database file not found on the server.' }, { status: 404 })
    }

    const buffer = await fs.promises.readFile(dbFile)
    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, 19)

    return new NextResponse(new Blob([new Uint8Array(buffer)]), {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="fizam-backup-${stamp}.db"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    console.error('[admin/backup]', e)
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
  }
}

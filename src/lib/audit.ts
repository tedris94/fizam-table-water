import type {
  CollectionConfig,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalConfig,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'
import type { AuditLog } from '@/payload-types'

type AuditEntry = Omit<AuditLog, 'id' | 'updatedAt' | 'createdAt'>

/** Never store these in the audit trail. */
const SENSITIVE_FIELDS = new Set([
  'hash',
  'salt',
  'password',
  'resetPasswordToken',
  'resetPasswordExpiration',
])

/**
 * Field changes that are pure session/auth bookkeeping. If an update only
 * touches these, we skip the audit entry (login itself is logged separately).
 */
const NOISE_FIELDS = new Set([
  'sessions',
  'loginAttempts',
  'lockUntil',
  'updatedAt',
  'createdAt',
  ...SENSITIVE_FIELDS,
])

type AnyDoc = Record<string, unknown> & { id?: unknown }

function deriveTitle(doc: AnyDoc): string {
  const candidates = ['name', 'title', 'customerName', 'fullName', 'slug', 'email', 'siteName']
  for (const key of candidates) {
    const val = doc[key]
    if (typeof val === 'string' && val.trim()) return val.slice(0, 200)
  }
  return doc.id != null ? `#${String(doc.id)}` : ''
}

function isPlainValue(v: unknown): boolean {
  return v === null || ['string', 'number', 'boolean'].includes(typeof v)
}

function redactSnapshot(doc: AnyDoc): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(doc)) {
    if (SENSITIVE_FIELDS.has(key)) continue
    if (isPlainValue(value)) out[key] = value
  }
  return out
}

function diffFields(prev: AnyDoc, next: AnyDoc): Record<string, { from: unknown; to: unknown }> {
  const changed: Record<string, { from: unknown; to: unknown }> = {}
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
  for (const key of keys) {
    if (NOISE_FIELDS.has(key)) continue
    const a = prev[key]
    const b = next[key]
    // Only diff scalar fields to keep entries compact and avoid huge JSON blobs.
    if (!isPlainValue(a) && !isPlainValue(b)) continue
    if (a !== b) changed[key] = { from: SENSITIVE_FIELDS.has(key) ? '***' : a, to: SENSITIVE_FIELDS.has(key) ? '***' : b }
  }
  return changed
}

function actorFromReq(req: PayloadRequest) {
  const user = req.user as { id?: unknown; email?: string; role?: string } | undefined
  let ip: string | undefined
  let userAgent: string | undefined
  try {
    const h = req.headers
    if (h && typeof h.get === 'function') {
      ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || undefined
      userAgent = h.get('user-agent') || undefined
    }
  } catch {
    // headers not available (local API) — fine
  }
  return {
    userId: typeof user?.id === 'number' ? user.id : Number(user?.id) || undefined,
    userEmail: user?.email,
    userRole: user?.role,
    ip,
    userAgent,
  }
}

async function writeAudit(req: PayloadRequest, entry: AuditEntry): Promise<void> {
  try {
    await req.payload.create({
      collection: 'audit-logs',
      data: entry,
      overrideAccess: true,
    })
  } catch (error) {
    // Auditing must never break the underlying operation.
    req.payload.logger.error({ msg: '[audit] failed to write entry', err: error })
  }
}

function makeAfterChange(slug: string): CollectionAfterChangeHook {
  return async ({ req, operation, doc, previousDoc }) => {
    try {
      const actor = actorFromReq(req)
      if (operation === 'create') {
        await writeAudit(req, {
          action: 'create',
          collectionSlug: slug,
          documentId: String((doc as AnyDoc).id ?? ''),
          title: deriveTitle(doc as AnyDoc),
          changes: { created: redactSnapshot(doc as AnyDoc) },
          ...actor,
        })
      } else {
        const changed = diffFields((previousDoc ?? {}) as AnyDoc, doc as AnyDoc)
        // Skip noise-only updates (e.g. login session bookkeeping).
        if (Object.keys(changed).length === 0) return doc
        await writeAudit(req, {
          action: 'update',
          collectionSlug: slug,
          documentId: String((doc as AnyDoc).id ?? ''),
          title: deriveTitle(doc as AnyDoc),
          changes: { changed },
          ...actor,
        })
      }
    } catch (error) {
      req.payload.logger.error({ msg: '[audit] afterChange error', err: error })
    }
    return doc
  }
}

function makeAfterDelete(slug: string): CollectionAfterDeleteHook {
  return async ({ req, doc, id }) => {
    try {
      await writeAudit(req, {
        action: 'delete',
        collectionSlug: slug,
        documentId: String(id ?? (doc as AnyDoc)?.id ?? ''),
        title: deriveTitle((doc ?? {}) as AnyDoc),
        changes: { deleted: redactSnapshot((doc ?? {}) as AnyDoc) },
        ...actorFromReq(req),
      })
    } catch (error) {
      req.payload.logger.error({ msg: '[audit] afterDelete error', err: error })
    }
    return doc
  }
}

/**
 * Wrap a collection so create/update/delete operations are recorded to the
 * `audit-logs` collection. Existing hooks are preserved.
 */
export function withAudit(collection: CollectionConfig): CollectionConfig {
  const slug = collection.slug
  const hooks = collection.hooks ?? {}
  return {
    ...collection,
    hooks: {
      ...hooks,
      afterChange: [...(hooks.afterChange ?? []), makeAfterChange(slug)],
      afterDelete: [...(hooks.afterDelete ?? []), makeAfterDelete(slug)],
    },
  }
}

function makeGlobalAfterChange(slug: string): GlobalAfterChangeHook {
  return async ({ req, doc, previousDoc }) => {
    try {
      const changed = diffFields((previousDoc ?? {}) as AnyDoc, doc as AnyDoc)
      if (Object.keys(changed).length === 0) return doc
      await writeAudit(req, {
        action: 'update',
        collectionSlug: slug,
        documentId: slug,
        title: deriveTitle(doc as AnyDoc) || slug,
        changes: { changed },
        ...actorFromReq(req),
      })
    } catch (error) {
      req.payload.logger.error({ msg: '[audit] global afterChange error', err: error })
    }
    return doc
  }
}

/** Wrap a global so updates are recorded to the `audit-logs` collection. */
export function withGlobalAudit(global: GlobalConfig): GlobalConfig {
  const hooks = global.hooks ?? {}
  return {
    ...global,
    hooks: {
      ...hooks,
      afterChange: [...(hooks.afterChange ?? []), makeGlobalAfterChange(global.slug)],
    },
  }
}

/** Record an authentication event (login/logout) to the audit trail. */
export async function recordAuthEvent(
  req: PayloadRequest,
  action: 'login' | 'logout',
  user?: { id?: unknown; email?: string; role?: string } | null,
): Promise<void> {
  const actor = actorFromReq(req)
  await writeAudit(req, {
    action,
    collectionSlug: 'users',
    documentId: user?.id != null ? String(user.id) : actor.userId != null ? String(actor.userId) : '',
    title: user?.email ?? actor.userEmail ?? '',
    userId: typeof user?.id === 'number' ? user.id : Number(user?.id) || actor.userId,
    userEmail: user?.email ?? actor.userEmail,
    userRole: user?.role ?? actor.userRole,
    ip: actor.ip,
    userAgent: actor.userAgent,
  })
}

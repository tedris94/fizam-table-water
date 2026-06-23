'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { EmailTemplatePreview } from './EmailTemplatePreview'
import { RichTextEditor } from './RichTextEditor'
import {
  EMAIL_TEMPLATE_SAMPLE_VARS,
  type EmailTemplateCategory,
  type EmailTemplateSlug,
} from '@/lib/emailTemplateCatalog'
import { previewEmailTemplate, type EmailTemplateRecord } from '@/lib/emailTemplateRender'
import { htmlToPlainText, parsePlaceholderTokens } from '@/lib/emailTemplateTokens'
import { Mail, RotateCcw, Save, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { canEditEmailTemplate } from '@/lib/emailTemplateCatalog'

const CATEGORY_LABELS: Record<EmailTemplateCategory, string> = {
  careers: 'Careers',
  orders: 'Orders',
  contact: 'Contact form',
  internal: 'Internal alerts',
}

interface EmailTemplatesViewProps {
  role: string
}

export function EmailTemplatesView({ role }: EmailTemplatesViewProps) {
  const { capabilities } = useAuth()
  const [templates, setTemplates] = useState<EmailTemplateRecord[]>([])
  const [selectedSlug, setSelectedSlug] = useState<EmailTemplateSlug | null>(null)
  const [draft, setDraft] = useState<Pick<
    EmailTemplateRecord,
    'subject' | 'textBody' | 'htmlBody' | 'enabled' | 'layout'
  > | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const selected = templates.find((t) => t.slug === selectedSlug) ?? null

  const grouped = useMemo(() => {
    const groups: Record<EmailTemplateCategory, EmailTemplateRecord[]> = {
      careers: [],
      orders: [],
      contact: [],
      internal: [],
    }
    for (const template of templates) {
      groups[template.category].push(template)
    }
    return groups
  }, [templates])

  const insertTokens = useMemo(
    () => (selected ? parsePlaceholderTokens(selected.variablesHelp) : []),
    [selected],
  )

  const preview = useMemo(() => {
    if (!selected || !draft) return null
    return previewEmailTemplate(
      selected.slug,
      draft,
      EMAIL_TEMPLATE_SAMPLE_VARS[selected.slug],
    )
  }, [selected, draft])

  useEffect(() => {
    void fetchTemplates()
  }, [])

  async function fetchTemplates() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/email-templates', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Could not load email templates.')
      const data = (await res.json()) as EmailTemplateRecord[]
      setTemplates(data)
      if (!selectedSlug && data.length > 0) {
        selectTemplate(data[0])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load templates.')
    } finally {
      setLoading(false)
    }
  }

  function selectTemplate(template: EmailTemplateRecord) {
    setSelectedSlug(template.slug)
    setDraft({
      subject: template.subject,
      textBody: template.textBody,
      htmlBody: template.htmlBody,
      enabled: template.enabled,
      layout: template.layout,
    })
    setNotice(null)
    setError(null)
  }

  function syncPlainTextFromHtml() {
    if (!draft) return
    setDraft({ ...draft, textBody: htmlToPlainText(draft.htmlBody) })
    setNotice('Plain-text body updated from visual editor.')
  }

  async function handleSave() {
    if (!selected || !draft) return
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const res = await fetch(`/api/admin/email-templates/${selected.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: draft.subject,
          textBody: draft.textBody,
          htmlBody: draft.htmlBody,
          enabled: draft.enabled,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Failed to save template.')
      }
      const updated = (await res.json()) as EmailTemplateRecord
      setTemplates((prev) => prev.map((t) => (t.slug === updated.slug ? updated : t)))
      setDraft({
        subject: updated.subject,
        textBody: updated.textBody,
        htmlBody: updated.htmlBody,
        enabled: updated.enabled,
        layout: updated.layout,
      })
      setNotice('Template saved.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save template.')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    if (!selected || !confirm(`Reset "${selected.name}" to the default content?`)) return
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const res = await fetch(`/api/admin/email-templates/${selected.slug}?action=reset`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Failed to reset template.')
      }
      const updated = (await res.json()) as EmailTemplateRecord
      setTemplates((prev) => prev.map((t) => (t.slug === updated.slug ? updated : t)))
      setDraft({
        subject: updated.subject,
        textBody: updated.textBody,
        htmlBody: updated.htmlBody,
        enabled: updated.enabled,
        layout: updated.layout,
      })
      setNotice('Template reset to defaults.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset template.')
    } finally {
      setSaving(false)
    }
  }

  const canEdit =
    selected && canEditEmailTemplate(role, selected.category, capabilities)

  return (
    <DashboardLayout title="Email Templates" role={role}>
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-2xl text-[#1a1f71]">Email Templates</h2>
          <p className="text-gray-600">
            Edit subject and body for every automated email. Use the visual editor and live preview on
            the right — placeholders like{' '}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">{'{{jobTitle}}'}</code> are
            filled in when the email is sent.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div className="rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {notice}
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading templates…</p>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
            <aside className="h-fit space-y-4 rounded-2xl bg-white p-4 shadow-lg xl:sticky xl:top-24">
              {(Object.keys(grouped) as EmailTemplateCategory[]).map((category) => {
                const items = grouped[category]
                if (items.length === 0) return null
                return (
                  <div key={category}>
                    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {CATEGORY_LABELS[category]}
                    </p>
                    <div className="space-y-1">
                      {items.map((template) => (
                        <button
                          key={template.slug}
                          type="button"
                          onClick={() => selectTemplate(template)}
                          className={`flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                            selectedSlug === template.slug
                              ? 'bg-blue-50 text-[#1a1f71]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#2563eb]" />
                          <span>
                            <span className="block font-medium">{template.name}</span>
                            {!template.enabled && (
                              <span className="text-xs text-amber-600">Disabled</span>
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </aside>

            {selected && draft ? (
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-4 rounded-2xl bg-white p-6 shadow-lg">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl text-[#1a1f71]">{selected.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{selected.description}</p>
                    </div>
                    {canEdit && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void handleReset()}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reset
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void handleSave()}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1f71] to-[#2563eb] px-4 py-2 text-sm text-white hover:shadow-lg disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[#1a1f71]">
                    <strong>Placeholders:</strong> {selected.variablesHelp}
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={draft.enabled}
                      disabled={!canEdit || saving}
                      onChange={(e) =>
                        setDraft((prev) => (prev ? { ...prev, enabled: e.target.checked } : prev))
                      }
                      className="rounded border-gray-300"
                    />
                    Email enabled
                  </label>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Subject</label>
                    <input
                      type="text"
                      value={draft.subject}
                      disabled={!canEdit || saving}
                      onChange={(e) =>
                        setDraft((prev) => (prev ? { ...prev, subject: e.target.value } : prev))
                      }
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-[#2563eb] focus:outline-none disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email body (visual editor)
                    </label>
                    <RichTextEditor
                      key={selected.slug}
                      value={draft.htmlBody}
                      disabled={!canEdit || saving}
                      insertTokens={insertTokens}
                      placeholder="Write the email content. Use Insert placeholder for dynamic fields."
                      onChange={(htmlBody) =>
                        setDraft((prev) => (prev ? { ...prev, htmlBody } : prev))
                      }
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Branded header and footer are added automatically — preview updates on the
                      right.
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Plain-text fallback
                      </label>
                      {canEdit && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={syncPlainTextFromHtml}
                          className="inline-flex items-center gap-1 text-xs text-[#2563eb] hover:underline disabled:opacity-50"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Sync from visual editor
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={8}
                      value={draft.textBody}
                      disabled={!canEdit || saving}
                      onChange={(e) =>
                        setDraft((prev) => (prev ? { ...prev, textBody: e.target.value } : prev))
                      }
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-mono text-sm focus:border-[#2563eb] focus:outline-none disabled:bg-gray-50"
                    />
                  </div>

                  {!canEdit && (
                    <p className="text-sm text-amber-700">
                      View-only access. Contact an administrator to edit non-careers templates.
                    </p>
                  )}
                </div>

                <div className="xl:sticky xl:top-24 xl:self-start">
                  {preview ? (
                    <EmailTemplatePreview
                      subject={preview.subject}
                      html={preview.html}
                      text={preview.text}
                    />
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-8 text-center text-gray-600 shadow-lg">
                Select a template to edit.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

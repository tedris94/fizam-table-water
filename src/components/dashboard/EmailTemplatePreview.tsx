'use client'

type EmailTemplatePreviewProps = {
  subject: string
  html: string
  text: string
}

export function EmailTemplatePreview({ subject, html, text }: EmailTemplatePreviewProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Subject</p>
        <p className="text-sm font-medium text-gray-900">{subject}</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-[#e8eaed] shadow-sm">
        <div className="border-b border-gray-200 bg-white px-4 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Final email preview
          </p>
          <p className="text-xs text-gray-500">Includes branded header and footer as recipients see it</p>
        </div>
        <iframe
          title="Email preview"
          className="min-h-[520px] w-full flex-1 border-0 bg-[#f4f6fb]"
          srcDoc={html}
          sandbox="allow-same-origin"
        />
      </div>

      <details className="rounded-xl border border-gray-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700">
          Plain-text version
        </summary>
        <pre className="max-h-48 overflow-auto border-t border-gray-100 px-4 py-3 text-xs whitespace-pre-wrap text-gray-600">
          {text}
        </pre>
      </details>
    </div>
  )
}

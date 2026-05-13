'use client'

import { useState } from 'react'
import { FileText, CheckCircle } from 'lucide-react'

type Props = {
  jobSlug: string
  jobTitle?: string
}

export function JobApplicationForm({ jobSlug, jobTitle }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')
    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set('jobSlug', jobSlug)

    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Submit failed')
      }
      setStatus('sent')
      form.reset()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Submit failed')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl text-[#1a1f71] mb-4">Application Submitted!</h2>
        <p className="text-xl text-gray-600 mb-8">
          {jobTitle
            ? `Thank you for applying to the ${jobTitle} position. We'll review your application and get back to you soon.`
            : "Thank you for applying. We'll review your application and get back to you soon."}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="/careers"
            className="bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white px-8 py-3 rounded-full hover:shadow-lg transition-all"
          >
            View More Openings
          </a>
          <a
            href="/"
            className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full hover:bg-gray-50 transition-all"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="jobSlug" value={jobSlug} readOnly />

      <div>
        <label className="block text-sm text-gray-700 mb-2">Full Name *</label>
        <input
          type="text"
          name="fullName"
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
          placeholder="John Doe"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-2">Email Address *</label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
            placeholder="john@email.com"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Phone Number *</label>
          <input
            type="tel"
            name="phone"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
            placeholder="+234 800 000 0000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-2">Address *</label>
        <input
          type="text"
          name="address"
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
          placeholder="Your full address"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-2">Education *</label>
        <textarea
          name="education"
          required
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none resize-none"
          placeholder="Your educational background"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-2">Work Experience *</label>
        <textarea
          name="experience"
          required
          rows={4}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none resize-none"
          placeholder="Describe your relevant work experience"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-2">Cover Letter *</label>
        <textarea
          name="coverLetter"
          required
          rows={6}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none resize-none"
          placeholder="Why are you interested in this position?"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-2">Resume / CV (PDF)</label>
        <input
          type="file"
          name="resume"
          accept="application/pdf,.doc,.docx"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none text-sm"
        />
        <p className="text-sm text-gray-500 mt-2">
          Upload a PDF or Word document. Max ~10 MB.
        </p>
      </div>

      {status === 'error' && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {errorMessage || 'Could not submit. Please try again.'}
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="flex-1 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" />
          {status === 'sending' ? 'Submitting...' : 'Submit Application'}
        </button>
        <a
          href="/careers"
          className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all flex items-center"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}

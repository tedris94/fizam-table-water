'use client'

import { useState } from 'react'
import { FileText, CheckCircle, Plus, Trash2, GraduationCap, Briefcase, PenLine } from 'lucide-react'
import type { EducationEntry, WorkEntry } from '@/lib/applicationApi'

type Props = {
  jobSlug: string
  jobTitle?: string
}

const EMPTY_EDUCATION: EducationEntry = {
  qualification: '',
  institution: '',
  fieldOfStudy: '',
  startYear: '',
  endYear: '',
  grade: '',
}

const EMPTY_WORK: WorkEntry = {
  jobTitle: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
}

export function JobApplicationForm({ jobSlug, jobTitle }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [applicationRef, setApplicationRef] = useState<string | null>(null)
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(true)
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([{ ...EMPTY_EDUCATION }])
  const [workHistory, setWorkHistory] = useState<WorkEntry[]>([{ ...EMPTY_WORK }])
  const [professionalSummary, setProfessionalSummary] = useState('')
  const [motivationStatement, setMotivationStatement] = useState('')

  function updateEducation(index: number, patch: Partial<EducationEntry>) {
    setEducationHistory((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function updateWork(index: number, patch: Partial<WorkEntry>) {
    setWorkHistory((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set('jobSlug', jobSlug)
    fd.set('educationHistoryJson', JSON.stringify(educationHistory))
    fd.set('workHistoryJson', JSON.stringify(workHistory))
    fd.set('professionalSummary', professionalSummary)
    fd.set('motivationStatement', motivationStatement)

    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(err.error || 'Submit failed')
      }
      const data = (await res.json()) as {
        applicationRef?: string
        applicantEmailSent?: boolean
      }
      setApplicationRef(data.applicationRef ?? null)
      setConfirmationEmailSent(data.applicantEmailSent !== false)
      setStatus('sent')
      form.reset()
      setEducationHistory([{ ...EMPTY_EDUCATION }])
      setWorkHistory([{ ...EMPTY_WORK }])
      setProfessionalSummary('')
      setMotivationStatement('')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Submit failed')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl text-[#1a1f71] mb-4">Application Submitted!</h2>
        <p className="text-xl text-gray-600 mb-4">
          {jobTitle
            ? `Thank you for applying to the ${jobTitle} position.`
            : 'Thank you for applying.'}
        </p>
        {applicationRef && (
          <p className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-[#1a1f71]">
            Your application reference is{' '}
            <strong className="font-semibold">{applicationRef}</strong>.
            {confirmationEmailSent ? (
              <>
                {' '}
                We have sent a confirmation email with this reference — please check your inbox
                (and spam folder).
              </>
            ) : (
              <>
                {' '}
                Save this reference. We could not send a confirmation email right now; our HR team
                has still received your application.
              </>
            )}
          </p>
        )}
        <p className="text-gray-600 mb-8">
          Our HR team will review your application and email you when your status changes.
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-slate-50 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#1a1f71]">Personal details</h2>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Full Name *</label>
          <input
            type="text"
            name="fullName"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-[#2563eb] focus:outline-none"
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
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-[#2563eb] focus:outline-none"
              placeholder="john@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-[#2563eb] focus:outline-none"
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
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-[#2563eb] focus:outline-none"
            placeholder="Your full address"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1a1f71]">
            <GraduationCap className="h-5 w-5 text-[#2563eb]" />
            Education (CV format)
          </h2>
          <button
            type="button"
            onClick={() => setEducationHistory((prev) => [...prev, { ...EMPTY_EDUCATION }])}
            className="inline-flex items-center gap-1 text-sm text-[#2563eb] hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add education
          </button>
        </div>
        {educationHistory.map((entry, index) => (
          <div key={index} className="rounded-xl border border-gray-200 p-4 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Entry {index + 1}</p>
              {educationHistory.length > 1 && (
                <button
                  type="button"
                  onClick={() => setEducationHistory((prev) => prev.filter((_, i) => i !== index))}
                  className="text-red-600 hover:underline text-sm inline-flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                required
                value={entry.qualification}
                onChange={(e) => updateEducation(index, { qualification: e.target.value })}
                placeholder="Qualification (e.g. B.Sc) *"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#2563eb] focus:outline-none"
              />
              <input
                required
                value={entry.institution}
                onChange={(e) => updateEducation(index, { institution: e.target.value })}
                placeholder="Institution *"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#2563eb] focus:outline-none"
              />
              <input
                value={entry.fieldOfStudy}
                onChange={(e) => updateEducation(index, { fieldOfStudy: e.target.value })}
                placeholder="Field of study"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#2563eb] focus:outline-none"
              />
              <input
                value={entry.grade}
                onChange={(e) => updateEducation(index, { grade: e.target.value })}
                placeholder="Grade / class (optional)"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#2563eb] focus:outline-none"
              />
              <input
                value={entry.startYear}
                onChange={(e) => updateEducation(index, { startYear: e.target.value })}
                placeholder="Start year"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#2563eb] focus:outline-none"
              />
              <input
                value={entry.endYear}
                onChange={(e) => updateEducation(index, { endYear: e.target.value })}
                placeholder="End year"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1a1f71]">
            <Briefcase className="h-5 w-5 text-[#2563eb]" />
            Work experience (CV format)
          </h2>
          <button
            type="button"
            onClick={() => setWorkHistory((prev) => [...prev, { ...EMPTY_WORK }])}
            className="inline-flex items-center gap-1 text-sm text-[#2563eb] hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add experience
          </button>
        </div>
        {workHistory.map((entry, index) => (
          <div key={index} className="rounded-xl border border-gray-200 p-4 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Role {index + 1}</p>
              {workHistory.length > 1 && (
                <button
                  type="button"
                  onClick={() => setWorkHistory((prev) => prev.filter((_, i) => i !== index))}
                  className="text-red-600 hover:underline text-sm inline-flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                required
                value={entry.jobTitle}
                onChange={(e) => updateWork(index, { jobTitle: e.target.value })}
                placeholder="Job title *"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#2563eb] focus:outline-none"
              />
              <input
                required
                value={entry.company}
                onChange={(e) => updateWork(index, { company: e.target.value })}
                placeholder="Company / employer *"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#2563eb] focus:outline-none"
              />
              <input
                value={entry.location}
                onChange={(e) => updateWork(index, { location: e.target.value })}
                placeholder="Location"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#2563eb] focus:outline-none"
              />
              <label className="flex items-center gap-2 text-sm text-gray-700 px-1">
                <input
                  type="checkbox"
                  checked={Boolean(entry.current)}
                  onChange={(e) =>
                    updateWork(index, { current: e.target.checked, endDate: e.target.checked ? '' : entry.endDate })
                  }
                />
                I currently work here
              </label>
              <input
                value={entry.startDate}
                onChange={(e) => updateWork(index, { startDate: e.target.value })}
                placeholder="Start (e.g. Jan 2020)"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#2563eb] focus:outline-none"
              />
              {!entry.current && (
                <input
                  value={entry.endDate}
                  onChange={(e) => updateWork(index, { endDate: e.target.value })}
                  placeholder="End (e.g. Dec 2023)"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#2563eb] focus:outline-none"
                />
              )}
            </div>
            <textarea
              value={entry.description}
              onChange={(e) => updateWork(index, { description: e.target.value })}
              rows={3}
              placeholder="Key responsibilities and achievements"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#2563eb] focus:outline-none resize-y"
            />
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1a1f71]">
          <PenLine className="h-5 w-5 text-[#2563eb]" />
          Cover letter (CV format)
        </h2>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Professional summary *</label>
          <textarea
            required
            value={professionalSummary}
            onChange={(e) => setProfessionalSummary(e.target.value)}
            rows={4}
            placeholder="Brief overview of your background, skills, and what you bring to the role"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none resize-y"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Why this role at Fizam? *</label>
          <textarea
            required
            value={motivationStatement}
            onChange={(e) => setMotivationStatement(e.target.value)}
            rows={5}
            placeholder="Explain your interest in this position and why you want to join Fizam Table Water"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none resize-y"
          />
        </div>
      </section>

      <section>
        <label className="block text-sm text-gray-700 mb-2">Resume / CV (PDF)</label>
        <input
          type="file"
          name="resume"
          accept="application/pdf,.doc,.docx"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none text-sm"
        />
        <p className="text-sm text-gray-500 mt-2">Optional. Upload a PDF or Word document. Max ~10 MB.</p>
      </section>

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

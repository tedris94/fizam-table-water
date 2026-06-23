import { NextResponse } from 'next/server'
import {
  type EducationEntry,
  type WorkEntry,
  formatCoverLetterText,
  formatEducationText,
  formatExperienceText,
  parseJsonArray,
} from '@/lib/applicationApi'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'
import {
  notifyHrNewApplication,
  sendApplicationReceivedEmail,
} from '@/lib/applicationEmails'
import { formatApplicationRef } from '@/lib/applicationRef'
import { getPayloadSingleton } from '@/lib/payload'

export const runtime = 'nodejs'

function sanitizeEducation(entries: EducationEntry[]) {
  return entries
    .map((e) => ({
      qualification: String(e.qualification ?? '').trim(),
      institution: String(e.institution ?? '').trim(),
      fieldOfStudy: String(e.fieldOfStudy ?? '').trim() || undefined,
      startYear: String(e.startYear ?? '').trim() || undefined,
      endYear: String(e.endYear ?? '').trim() || undefined,
      grade: String(e.grade ?? '').trim() || undefined,
    }))
    .filter((e) => e.qualification && e.institution)
}

function sanitizeWork(entries: WorkEntry[]) {
  return entries
    .map((e) => ({
      jobTitle: String(e.jobTitle ?? '').trim(),
      company: String(e.company ?? '').trim(),
      location: String(e.location ?? '').trim() || undefined,
      startDate: String(e.startDate ?? '').trim() || undefined,
      endDate: String(e.endDate ?? '').trim() || undefined,
      current: Boolean(e.current),
      description: String(e.description ?? '').trim() || undefined,
    }))
    .filter((e) => e.jobTitle && e.company)
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 })
    }

    const form = await request.formData()

    const jobSlug = String(form.get('jobSlug') || '')
    const fullName = String(form.get('fullName') || '')
    const email = String(form.get('email') || '')
    const phone = String(form.get('phone') || '')
    const address = String(form.get('address') || '')
    const professionalSummary = String(form.get('professionalSummary') || '')
    const motivationStatement = String(form.get('motivationStatement') || '')
    const educationHistory = sanitizeEducation(
      parseJsonArray<EducationEntry>(String(form.get('educationHistoryJson') || '')),
    )
    const workHistory = sanitizeWork(
      parseJsonArray<WorkEntry>(String(form.get('workHistoryJson') || '')),
    )
    const resume = form.get('resume')

    if (!jobSlug || !fullName || !email || !phone || !address) {
      return NextResponse.json({ error: 'Missing required contact fields.' }, { status: 400 })
    }
    if (educationHistory.length === 0) {
      return NextResponse.json({ error: 'Add at least one education entry.' }, { status: 400 })
    }
    if (workHistory.length === 0) {
      return NextResponse.json({ error: 'Add at least one work experience entry.' }, { status: 400 })
    }
    if (!professionalSummary.trim() || !motivationStatement.trim()) {
      return NextResponse.json({ error: 'Professional summary and motivation statement are required.' }, { status: 400 })
    }

    const payload = await getPayloadSingleton()

    const jobs = await payload.find({
      collection: 'jobs',
      limit: 1,
      where: { slug: { equals: jobSlug } },
    })

    const job = jobs.docs[0]
    if (!job || job.status !== 'active') {
      return NextResponse.json({ error: 'Job not found or no longer active.' }, { status: 404 })
    }

    let resumeMediaId: number | undefined

    if (resume && resume instanceof File && resume.size > 0) {
      const buf = Buffer.from(await resume.arrayBuffer())
      const safeName = resume.name.replace(/[^\w.\-]+/g, '_')
      const tmp = join(tmpdir(), `${randomBytes(8).toString('hex')}-${safeName}`)
      await writeFile(tmp, buf)
      try {
        const media = await payload.create({
          collection: 'media',
          data: {
            alt: `Resume — ${fullName}`,
          },
          filePath: tmp,
          overrideAccess: true,
        })
        resumeMediaId = typeof media.id === 'number' ? media.id : Number(media.id)
      } finally {
        await unlink(tmp).catch(() => {})
      }
    }

    const education = formatEducationText(educationHistory)
    const experience = formatExperienceText(workHistory)
    const coverLetter = formatCoverLetterText(professionalSummary, motivationStatement)

    const created = await payload.create({
      collection: 'applications',
      data: {
        job: job.id,
        fullName,
        email,
        phone,
        address,
        educationHistory,
        workHistory,
        professionalSummary: professionalSummary.trim(),
        motivationStatement: motivationStatement.trim(),
        education,
        experience,
        coverLetter,
        ...(resumeMediaId !== undefined ? { resume: resumeMediaId } : {}),
        status: 'pending',
      },
      overrideAccess: true,
    })

    const applicationRef = formatApplicationRef(created.id)
    await payload.update({
      collection: 'applications',
      id: created.id,
      data: { applicationRef },
      overrideAccess: true,
    })

    let applicantEmailSent = false
    let applicantEmailError: string | undefined
    try {
      const result = await sendApplicationReceivedEmail({
        to: email,
        applicantName: fullName,
        jobTitle: job.title,
        applicationRef,
      })
      applicantEmailSent = !result.skipped
    } catch (err) {
      applicantEmailError =
        err instanceof Error ? err.message : 'Could not send confirmation email.'
      console.error('[careers/apply] applicant email', err)
    }

    void notifyHrNewApplication({
      applicantName: fullName,
      jobTitle: job.title,
      email,
      applicationRef,
    }).catch((err) => console.error('[careers/apply] HR email', err))

    return NextResponse.json({
      ok: true,
      applicationRef,
      applicantEmailSent,
      applicantEmailError,
    })
  } catch (e) {
    console.error('[careers/apply]', e)
    return NextResponse.json({ error: 'Could not submit application.' }, { status: 500 })
  }
}

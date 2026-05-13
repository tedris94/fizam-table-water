import { NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'
import { getPayloadSingleton } from '@/lib/payload'
import { notifyNewApplication } from '@/lib/email'

export const runtime = 'nodejs'

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
    const education = String(form.get('education') || '')
    const experience = String(form.get('experience') || '')
    const coverLetter = String(form.get('coverLetter') || '')
    const resume = form.get('resume')

    if (!jobSlug || !fullName || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
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

    await payload.create({
      collection: 'applications',
      data: {
        job: job.id,
        fullName,
        email,
        phone,
        address,
        education,
        experience,
        coverLetter,
        ...(resumeMediaId !== undefined ? { resume: resumeMediaId } : {}),
        status: 'pending',
      },
      overrideAccess: true,
    })

    await notifyNewApplication({
      applicantName: fullName,
      jobTitle: job.title,
      email,
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[careers/apply]', e)
    return NextResponse.json({ error: 'Could not submit application.' }, { status: 500 })
  }
}

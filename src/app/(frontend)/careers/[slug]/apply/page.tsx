import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadSingleton } from '@/lib/payload'
import { JobApplicationForm } from '@/components/frontend/JobApplicationForm'
import { Navbar } from '@/components/frontend/Navbar'
import { Footer } from '@/components/frontend/Footer'
import { BackToTop } from '@/components/frontend/BackToTop'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const payload = await getPayloadSingleton()
    const jobs = await payload.find({
      collection: 'jobs',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    const job = jobs.docs[0]
    return { title: job ? `Apply — ${job.title}` : 'Apply — Fizam' }
  } catch {
    return { title: 'Apply — Fizam' }
  }
}

export default async function ApplyPage({ params }: Props) {
  const { slug } = await params

  let job: { title: string; department: string } | null = null
  try {
    const payload = await getPayloadSingleton()
    const jobs = await payload.find({
      collection: 'jobs',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    const found = jobs.docs[0]
    if (found && found.status === 'active') {
      job = { title: found.title, department: found.department || '' }
    }
  } catch {
    // Treat DB errors as not-found below.
  }

  if (!job) notFound()

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl text-[#1a1f71] mb-2">Apply for Position</h1>
              <p className="text-2xl text-[#2563eb]">{job.title}</p>
              <p className="text-gray-600">{job.department}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <JobApplicationForm jobSlug={slug} jobTitle={job.title} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <BackToTop />
    </>
  )
}

import { buildPageMetadata, titleWithBrand } from '@/lib/seo'
import { getPayloadSingleton } from '@/lib/payload'
import { SimpleNavbar } from '@/components/frontend/SimpleNavbar'
import { Footer } from '@/components/frontend/Footer'
import { BackToTop } from '@/components/frontend/BackToTop'
import { CareersList, type JobCard } from '@/components/frontend/CareersList'

export const metadata = buildPageMetadata({
  title: titleWithBrand('Careers — Join Fizam'),
  description:
    'Careers at Fizam Table Water in Nigeria. View open roles in production, quality, sales, and operations.',
  path: '/careers',
})

export const dynamic = 'force-dynamic'

const FALLBACK_JOBS: JobCard[] = [
  {
    id: 'job-1',
    slug: 'production-supervisor',
    title: 'Production Supervisor',
    department: 'Operations',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    salaryRange: '₦150,000 - ₦250,000/month',
    description:
      'We are seeking an experienced Production Supervisor to oversee daily production operations and ensure quality standards are maintained.',
    requirements: [
      "Bachelor's degree in Engineering or related field",
      '3+ years of experience in production management',
      'Strong leadership and organizational skills',
      'Knowledge of quality control processes',
      'Excellent problem-solving abilities',
    ],
    postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-2',
    slug: 'sales-representative',
    title: 'Sales Representative',
    department: 'Sales',
    location: 'Abuja, Nigeria',
    type: 'Full-time',
    salaryRange: '₦100,000 - ₦180,000/month',
    description:
      'Join our sales team to expand our market presence and build relationships with retail and wholesale customers.',
    requirements: [
      'Minimum of 2 years sales experience',
      'Strong communication and negotiation skills',
      "Valid driver's license",
      'Ability to work independently',
      'Customer-focused mindset',
    ],
    postedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-3',
    slug: 'quality-control-officer',
    title: 'Quality Control Officer',
    department: 'Quality Assurance',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    salaryRange: '₦120,000 - ₦200,000/month',
    description:
      'Ensure product quality through testing, monitoring, and compliance with health and safety standards.',
    requirements: [
      'Degree in Food Science, Chemistry, or related field',
      'Experience in quality control or food safety',
      'Attention to detail',
      'Knowledge of NAFDAC regulations',
      'Analytical thinking skills',
    ],
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-4',
    slug: 'delivery-driver',
    title: 'Delivery Driver',
    department: 'Logistics',
    location: 'Port Harcourt, Nigeria',
    type: 'Full-time',
    salaryRange: '₦80,000 - ₦120,000/month',
    description:
      'Deliver water products to customers while maintaining excellent customer service standards.',
    requirements: [
      "Valid driver's license",
      'Clean driving record',
      'Knowledge of local routes',
      'Good customer service skills',
      'Physical fitness for loading/unloading',
    ],
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-5',
    slug: 'hr-officer',
    title: 'HR Officer',
    department: 'Human Resources',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    salaryRange: '₦130,000 - ₦200,000/month',
    description:
      'Support HR operations including recruitment, employee relations, and administrative tasks.',
    requirements: [
      'Degree in Human Resources or related field',
      '2+ years HR experience',
      'Strong interpersonal skills',
      'Knowledge of labor laws',
      'Proficiency in MS Office',
    ],
    postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default async function CareersPage() {
  let jobs: JobCard[] = FALLBACK_JOBS
  try {
    const payload = await getPayloadSingleton()
    const result = await payload.find({
      collection: 'jobs',
      where: { status: { equals: 'active' } },
      sort: '-createdAt',
      limit: 50,
    })
    if (result.docs.length > 0) {
      jobs = result.docs.map(
        (doc): JobCard => ({
          id: String(doc.id),
          slug: doc.slug || String(doc.id),
          title: doc.title,
          department: doc.department || 'General',
          location: doc.location || '',
          type: doc.type || 'Full-time',
          salaryRange: doc.salaryRange || '',
          description: doc.description || '',
          requirements: Array.isArray(doc.requirements)
            ? doc.requirements.map((r: any) => r.item).filter(Boolean)
            : [],
          postedDate: doc.postedDate || doc.createdAt,
        }),
      )
    }
  } catch {
    // Fallback to demo dataset.
  }

  return (
    <>
      <SimpleNavbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl text-[#1a1f71] mb-4">Join Our Team</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Be part of our mission to deliver quality water to every home
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#1a1f71] to-[#2563eb] rounded-3xl p-12 mb-16 text-white">
            <h2 className="text-3xl mb-8 text-center">Why Work at Fizam?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-xl mb-2">Career Growth</h3>
                <p className="text-blue-100">Opportunities for professional development and advancement</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl mb-2">Great Culture</h3>
                <p className="text-blue-100">Collaborative and supportive work environment</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-xl mb-2">Benefits Package</h3>
                <p className="text-blue-100">Competitive salary and comprehensive benefits</p>
              </div>
            </div>
          </div>

          <CareersList jobs={jobs} />
        </div>
      </div>
      <Footer />
      <BackToTop />
    </>
  )
}

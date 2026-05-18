import { buildPageMetadata, titleWithBrand } from '@/lib/seo'
import { getPayloadSingleton } from '@/lib/payload'
import { TeamGrid, type TeamMemberCard } from '@/components/frontend/TeamGrid'
import { SimpleNavbar } from '@/components/frontend/SimpleNavbar'
import { Footer } from '@/components/frontend/Footer'
import { BackToTop } from '@/components/frontend/BackToTop'

export const metadata = buildPageMetadata({
  title: titleWithBrand('Our Team'),
  description:
    'Meet the Fizam Table Water team behind Nigeria’s trusted NAFDAC-certified drinking water brand.',
  path: '/team',
})

export const dynamic = 'force-dynamic'

const FALLBACK_TEAM: TeamMemberCard[] = [
  {
    id: 'team-1',
    name: 'John Adeyemi',
    position: 'Chief Executive Officer',
    department: 'Executive',
    bio: 'Leading Fizam Table Water with 15+ years of experience in the beverage industry.',
    email: 'john.adeyemi@fizam.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
  },
  {
    id: 'team-2',
    name: 'Sarah Okonkwo',
    position: 'Production Manager',
    department: 'Operations',
    bio: 'Overseeing production processes to ensure quality and efficiency in water production.',
    email: 'sarah.okonkwo@fizam.com',
    linkedin: 'https://linkedin.com',
  },
  {
    id: 'team-3',
    name: 'David Bello',
    position: 'Quality Control Manager',
    department: 'Quality Assurance',
    bio: 'Ensuring every bottle meets our stringent quality standards and safety requirements.',
    email: 'david.bello@fizam.com',
  },
  {
    id: 'team-4',
    name: 'Grace Nnamdi',
    position: 'Sales Manager',
    department: 'Sales',
    bio: 'Driving sales growth and building strong relationships with distributors and retailers.',
    email: 'grace.nnamdi@fizam.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
  },
  {
    id: 'team-5',
    name: 'Ahmed Ibrahim',
    position: 'HR Director',
    department: 'Human Resources',
    bio: 'Managing talent acquisition and employee development programs.',
    email: 'ahmed.ibrahim@fizam.com',
  },
  {
    id: 'team-6',
    name: 'Blessing Eze',
    position: 'Marketing Manager',
    department: 'Marketing',
    bio: 'Creating innovative marketing strategies to expand our brand reach.',
    email: 'blessing.eze@fizam.com',
    linkedin: 'https://linkedin.com',
  },
]

export default async function TeamPage() {
  let members: TeamMemberCard[] = FALLBACK_TEAM
  try {
    const payload = await getPayloadSingleton()
    const result = await payload.find({
      collection: 'team-members',
      limit: 100,
      sort: 'sortOrder',
    })
    if (result.docs.length > 0) {
      members = result.docs.map((doc): TeamMemberCard => ({
        id: String(doc.id),
        name: doc.name,
        position: doc.position,
        department: doc.department || 'Team',
        bio: doc.bio || '',
        email: doc.email || '',
        linkedin: doc.linkedin || undefined,
        twitter: doc.twitter || undefined,
      }))
    }
  } catch {
    // Payload not yet seeded — show fallback so the page never breaks.
  }

  return (
    <>
      <SimpleNavbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl text-[#1a1f71] mb-4">Our Team</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet the dedicated professionals behind Fizam Table Water
            </p>
          </div>
          <TeamGrid members={members} />
        </div>
      </div>
      <Footer />
      <BackToTop />
    </>
  )
}

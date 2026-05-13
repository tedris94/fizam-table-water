import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '@payload-config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

process.chdir(root)

const dataDir = path.join(root, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

async function seed() {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    limit: 1,
  })

  if (existing.totalDocs === 0) {
    const users = [
      {
        email: 'superadmin@fizam.com',
        password: 'demo123',
        fullName: 'Super Administrator',
        role: 'super_admin' as const,
      },
      {
        email: 'admin@fizam.com',
        password: 'demo123',
        fullName: 'Admin User',
        role: 'admin' as const,
      },
      {
        email: 'hr@fizam.com',
        password: 'demo123',
        fullName: 'HR Manager',
        role: 'hr' as const,
      },
    ]

    for (const u of users) {
      await payload.create({
        collection: 'users',
        data: {
          email: u.email,
          password: u.password,
          fullName: u.fullName,
          role: u.role,
        },
      })
      console.log('Created user:', u.email)
    }
  }

  const products = await payload.find({ collection: 'products', limit: 1 })
  if (products.totalDocs === 0) {
    const defaults = [
      {
        name: 'Sachet Water',
        size: '30cl',
        price: 20,
        description: 'Perfect for quick refreshment on the go',
        stock: 10000,
      },
      {
        name: 'Table Water',
        size: '50cl',
        price: 50,
        description: 'Ideal for personal daily hydration',
        stock: 5000,
      },
      {
        name: 'Table Water',
        size: '75cl',
        price: 100,
        description: 'Great for sharing and family use',
        stock: 3000,
      },
      {
        name: 'Dispenser Bottle',
        size: '18.9L',
        price: 500,
        description: 'Perfect for office and home dispensers',
        stock: 1000,
      },
    ]
    for (const p of defaults) {
      await payload.create({
        collection: 'products',
        data: p,
      })
    }
    console.log('Seeded products.')
  }

  const team = await payload.find({ collection: 'team-members', limit: 1 })
  if (team.totalDocs === 0) {
    const members = [
      {
        name: 'John Adeyemi',
        position: 'Chief Executive Officer',
        department: 'Executive',
        bio: 'Leading Fizam Table Water with 15+ years of experience in the beverage industry.',
        email: 'john.adeyemi@fizam.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        sortOrder: 1,
      },
      {
        name: 'Sarah Okonkwo',
        position: 'Production Manager',
        department: 'Operations',
        bio: 'Overseeing production processes to ensure quality and efficiency in water production.',
        email: 'sarah.okonkwo@fizam.com',
        linkedin: 'https://linkedin.com',
        sortOrder: 2,
      },
      {
        name: 'David Bello',
        position: 'Quality Control Manager',
        department: 'Quality Assurance',
        bio: 'Ensuring every bottle meets our stringent quality standards and safety requirements.',
        email: 'david.bello@fizam.com',
        sortOrder: 3,
      },
      {
        name: 'Grace Nnamdi',
        position: 'Sales Manager',
        department: 'Sales',
        bio: 'Driving sales growth and building strong relationships with distributors and retailers.',
        email: 'grace.nnamdi@fizam.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        sortOrder: 4,
      },
      {
        name: 'Ahmed Ibrahim',
        position: 'HR Director',
        department: 'Human Resources',
        bio: 'Managing talent acquisition and employee development programs.',
        email: 'ahmed.ibrahim@fizam.com',
        sortOrder: 5,
      },
      {
        name: 'Blessing Eze',
        position: 'Marketing Manager',
        department: 'Marketing',
        bio: 'Creating innovative marketing strategies to expand our brand reach.',
        email: 'blessing.eze@fizam.com',
        linkedin: 'https://linkedin.com',
        sortOrder: 6,
      },
    ]
    for (const m of members) {
      await payload.create({
        collection: 'team-members',
        data: m,
      })
    }
    console.log('Seeded team members.')
  }

  const jobs = await payload.find({ collection: 'jobs', limit: 1 })
  if (jobs.totalDocs === 0) {
    const jobSeeds = [
      {
        title: 'Production Supervisor',
        slug: 'production-supervisor',
        department: 'Operations',
        location: 'Lagos, Nigeria',
        type: 'Full-time',
        salaryRange: '₦150,000 - ₦250,000/month',
        description:
          'We are seeking an experienced Production Supervisor to oversee daily production operations and ensure quality standards are maintained.',
        requirements: [
          { item: "Bachelor's degree in Engineering or related field" },
          { item: '3+ years of experience in production management' },
          { item: 'Strong leadership and organizational skills' },
          { item: 'Knowledge of quality control processes' },
          { item: 'Excellent problem-solving abilities' },
        ],
        postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active' as const,
      },
      {
        title: 'Sales Representative',
        slug: 'sales-representative',
        department: 'Sales',
        location: 'Abuja, Nigeria',
        type: 'Full-time',
        salaryRange: '₦100,000 - ₦180,000/month',
        description:
          'Join our sales team to expand our market presence and build relationships with retail and wholesale customers.',
        requirements: [
          { item: 'Minimum of 2 years sales experience' },
          { item: 'Strong communication and negotiation skills' },
          { item: 'Valid driver\'s license' },
          { item: 'Ability to work independently' },
          { item: 'Customer-focused mindset' },
        ],
        postedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active' as const,
      },
      {
        title: 'Quality Control Officer',
        slug: 'quality-control-officer',
        department: 'Quality Assurance',
        location: 'Lagos, Nigeria',
        type: 'Full-time',
        salaryRange: '₦120,000 - ₦200,000/month',
        description:
          'Ensure product quality through testing, monitoring, and compliance with health and safety standards.',
        requirements: [
          { item: 'Degree in Food Science, Chemistry, or related field' },
          { item: 'Experience in quality control or food safety' },
          { item: 'Attention to detail' },
          { item: 'Knowledge of NAFDAC regulations' },
          { item: 'Analytical thinking skills' },
        ],
        postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active' as const,
      },
    ]
    for (const j of jobSeeds) {
      await payload.create({
        collection: 'jobs',
        data: j,
      })
    }
    console.log('Seeded jobs.')
  }

  const zones = await payload.find({ collection: 'shipping-zones', limit: 1 })
  if (zones.totalDocs === 0) {
    const defaultZones = [
      {
        name: 'Abuja Metropolitan',
        fee: 1500,
        priority: 10,
        isActive: true,
        description: 'Same-day delivery within central Abuja.',
        states: [
          { value: 'FCT (Abuja)' },
          { value: 'FCT' },
          { value: 'Federal Capital Territory' },
        ],
        cities: [
          { value: 'Abuja' },
          { value: 'Garki' },
          { value: 'Wuse' },
          { value: 'Maitama' },
          { value: 'Asokoro' },
          { value: 'Gwarinpa' },
          { value: 'Kubwa' },
          { value: 'Gwagwalada' },
        ],
      },
      {
        name: 'Lagos Mainland & Island',
        fee: 2000,
        priority: 20,
        isActive: true,
        description: 'Next-day delivery across Lagos.',
        states: [{ value: 'Lagos' }],
        cities: [
          { value: 'Lagos' },
          { value: 'Ikeja' },
          { value: 'Lekki' },
          { value: 'Victoria Island' },
          { value: 'Surulere' },
          { value: 'Yaba' },
          { value: 'Ikorodu' },
        ],
      },
      {
        name: 'South-West',
        fee: 2500,
        priority: 30,
        isActive: true,
        description: 'Oyo, Ogun, Osun, Ondo, Ekiti.',
        states: [
          { value: 'Oyo' },
          { value: 'Ogun' },
          { value: 'Osun' },
          { value: 'Ondo' },
          { value: 'Ekiti' },
        ],
        cities: [],
      },
      {
        name: 'South-East & South-South',
        fee: 3500,
        priority: 40,
        isActive: true,
        description: 'Anambra, Enugu, Abia, Imo, Ebonyi, Rivers, Cross River, Akwa Ibom, Delta, Bayelsa, Edo.',
        states: [
          { value: 'Anambra' },
          { value: 'Enugu' },
          { value: 'Abia' },
          { value: 'Imo' },
          { value: 'Ebonyi' },
          { value: 'Rivers' },
          { value: 'Cross River' },
          { value: 'Akwa Ibom' },
          { value: 'Delta' },
          { value: 'Bayelsa' },
          { value: 'Edo' },
        ],
        cities: [],
      },
      {
        name: 'North-Central',
        fee: 3000,
        priority: 50,
        isActive: true,
        description: 'Benue, Kogi, Kwara, Nasarawa, Niger, Plateau.',
        states: [
          { value: 'Benue' },
          { value: 'Kogi' },
          { value: 'Kwara' },
          { value: 'Nasarawa' },
          { value: 'Niger' },
          { value: 'Plateau' },
        ],
        cities: [],
      },
      {
        name: 'North-West & North-East',
        fee: 4000,
        priority: 60,
        isActive: true,
        description: 'Kano, Kaduna, Katsina, Sokoto, Zamfara, Kebbi, Jigawa, Bauchi, Borno, Gombe, Adamawa, Yobe, Taraba.',
        states: [
          { value: 'Kano' },
          { value: 'Kaduna' },
          { value: 'Katsina' },
          { value: 'Sokoto' },
          { value: 'Zamfara' },
          { value: 'Kebbi' },
          { value: 'Jigawa' },
          { value: 'Bauchi' },
          { value: 'Borno' },
          { value: 'Gombe' },
          { value: 'Adamawa' },
          { value: 'Yobe' },
          { value: 'Taraba' },
        ],
        cities: [],
      },
    ]
    for (const z of defaultZones) {
      await payload.create({ collection: 'shipping-zones', data: z })
    }
    console.log('Seeded shipping zones.')
  }

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Fizam Table Water',
      contactEmail: 'hello@fizam.ng',
      contactPhone: '+234 800 000 0000',
      address: 'Lagos, Nigeria',
      defaultMetaTitle: 'Fizam Table Water — Pure hydration',
      defaultMetaDescription:
        'Trusted Nigerian table water brand. Order online, explore careers, and learn about our quality standards.',
    },
  })

  await payload.updateGlobal({
    slug: 'home-page',
    data: {
      heroTitle: 'Pure hydration for every Nigerian home',
      heroSubtitle:
        'Fizam delivers NAFDAC-certified drinking water from our factory to your door.',
      aboutHeading: 'About Fizam',
    },
  })

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})

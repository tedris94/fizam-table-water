import path from 'path'
import fs from 'fs'
import type { Payload } from 'payload'

/* -------------------------------------------------------------------------- */
/*  Minimal Lexical (rich text) builders                                       */
/* -------------------------------------------------------------------------- */

type Lex = Record<string, unknown>

function txt(text: string, bold = false): Lex {
  return { type: 'text', detail: 0, format: bold ? 1 : 0, mode: 'normal', style: '', text, version: 1 }
}

function para(children: Lex[] | string): Lex {
  const kids = typeof children === 'string' ? [txt(children)] : children
  return { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: kids }
}

/** Paragraph that starts with a bold label, e.g. "3.1 Placing Orders: …". */
function pBold(label: string, rest: string): Lex {
  return para([txt(label, true), txt(rest)])
}

function heading(text: string, tag: 'h2' | 'h3' = 'h2'): Lex {
  return { type: 'heading', tag, format: '', indent: 0, version: 1, direction: 'ltr', children: [txt(text)] }
}

function bullets(items: string[]): Lex {
  return {
    type: 'list',
    listType: 'bullet',
    start: 1,
    tag: 'ul',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: items.map((it, i) => ({
      type: 'listitem',
      value: i + 1,
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [txt(it)],
    })),
  }
}

function doc(children: Lex[]): Lex {
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } }
}

/* -------------------------------------------------------------------------- */
/*  Block helpers                                                              */
/* -------------------------------------------------------------------------- */

const pageHeader = (opts: {
  title: string
  subtitle?: string
  icon?: string
  align?: 'center' | 'left'
  showBreadcrumb?: boolean
}): Lex => ({
  blockType: 'pageHeader',
  title: opts.title,
  subtitle: opts.subtitle,
  icon: opts.icon,
  align: opts.align ?? 'center',
  showBreadcrumb: opts.showBreadcrumb ?? false,
})

const richText = (children: Lex[], variant: 'prose' | 'card' = 'prose'): Lex => ({
  blockType: 'richText',
  variant,
  content: doc(children),
})

const featureGrid = (opts: {
  heading?: string
  subheading?: string
  columns?: '2' | '3' | '4'
  features: { icon?: string; title: string; description?: string }[]
}): Lex => ({
  blockType: 'featureGrid',
  heading: opts.heading,
  subheading: opts.subheading,
  columns: opts.columns ?? '4',
  features: opts.features,
})

/* -------------------------------------------------------------------------- */
/*  Media helper                                                               */
/* -------------------------------------------------------------------------- */

async function ensureMedia(
  payload: Payload,
  relativePublicPath: string,
  alt: string,
): Promise<number | string | null> {
  const filename = path.basename(relativePublicPath)
  try {
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs[0]) return existing.docs[0].id
  } catch {
    // ignore — fall through to create
  }

  const absolute = path.join(process.cwd(), 'public', relativePublicPath)
  if (!fs.existsSync(absolute)) return null
  try {
    const created = await payload.create({
      collection: 'media',
      data: { alt },
      filePath: absolute,
      overrideAccess: true,
    })
    return created.id
  } catch {
    return null
  }
}

/* -------------------------------------------------------------------------- */
/*  Page definitions                                                           */
/* -------------------------------------------------------------------------- */

function aboutLayout(factoryImageId: number | string | null): Lex[] {
  return [
    pageHeader({
      title: 'About Us',
      subtitle: 'Fizam Table Water — Purity, Refreshment, and Quality You Can Trust.',
      align: 'left',
      showBreadcrumb: true,
    }),
    richText([
      para([
        txt('Fizam Table Water', true),
        txt(', a product of '),
        txt('Alfurat Nigeria Limited', true),
        txt(
          ', is committed to delivering premium-quality drinking water designed to meet the hydration needs of individuals, families, and businesses. Our product range includes bottled water (50cl and 75cl) as well as sachet water, carefully produced to provide freshness, purity, and satisfaction in every sip.',
        ),
      ]),
      para(
        'At Fizam, quality and safety remain our top priorities. Our water undergoes advanced purification processes, including reverse osmosis and ozonization, ensuring the removal of unwanted chemical substances, organic and inorganic impurities, and biological contaminants. This guarantees clean, safe, and reliable drinking water that meets high quality standards.',
      ),
      para(
        'With modern production facilities and a commitment to excellence, Fizam Table Water is positioned to serve the Federal Capital Territory (FCT) and beyond by providing highly purified, refreshing water products that complement everyday life.',
      ),
    ]),
    ...(factoryImageId
      ? [
          {
            blockType: 'imageText',
            heading: 'Our facility',
            body: 'A glimpse of where Fizam Table Water is produced — modern equipment and disciplined processes for every batch.',
            image: factoryImageId,
            imagePosition: 'right',
          } as Lex,
        ]
      : []),
    featureGrid({
      heading: 'Why customers choose Fizam',
      columns: '2',
      features: [
        {
          icon: 'shield',
          title: 'Quality & safety first',
          description:
            'Advanced purification including reverse osmosis and ozonization removes chemical, organic, inorganic, and biological contaminants.',
        },
        {
          icon: 'droplets',
          title: 'Fresh in every sip',
          description:
            'Bottled water (50cl and 75cl) and sachet water produced for freshness, purity, and satisfaction.',
        },
        {
          icon: 'factory',
          title: 'Modern production',
          description:
            'State-of-the-art facilities and disciplined processes support dependable supply for homes and businesses.',
        },
        {
          icon: 'award',
          title: 'Serving FCT & beyond',
          description:
            'Positioned to deliver highly purified, refreshing water across the Federal Capital Territory and Nigeria.',
        },
      ],
    }),
    {
      blockType: 'ctaBanner',
      heading: 'Ready to order or partner with us?',
      buttons: [
        { label: 'Order water', href: '/order', style: 'primary' },
        { label: 'Contact us', href: '/#contact', style: 'outline' },
        { label: 'Meet the team', href: '/team', style: 'outline' },
      ],
    } as Lex,
  ]
}

function qualityLayout(): Lex[] {
  return [
    pageHeader({
      title: 'Quality Certifications',
      subtitle:
        'Committed to excellence in every drop. Our certifications demonstrate our dedication to providing safe, pure, and high-quality water products.',
      icon: 'award',
    }),
    featureGrid({
      columns: '2',
      features: [
        {
          icon: 'shield',
          title: 'NAFDAC Certified',
          description:
            'Registered and certified by the National Agency for Food and Drug Administration and Control (NAFDAC), ensuring compliance with all national safety and quality standards. (Reg. No: NAFDAC-XXXXXX)',
        },
        {
          icon: 'award',
          title: 'SON Certified',
          description:
            'Certified by the Standards Organisation of Nigeria (SON) for meeting the mandatory standards for packaged drinking water in Nigeria. (SON Cert. No: XXXXX)',
        },
        {
          icon: 'checkCircle',
          title: 'ISO 9001:2015',
          description:
            'Our quality management system is certified to ISO 9001:2015 standards, demonstrating our commitment to consistent quality and continuous improvement.',
        },
        {
          icon: 'droplets',
          title: 'Water Quality Standards',
          description:
            'Our products meet and exceed WHO guidelines for drinking water quality, with regular laboratory testing to ensure purity and safety. (WHO Compliant)',
        },
      ],
    }),
    featureGrid({
      heading: 'Our Quality Process',
      columns: '3',
      features: [
        { icon: 'droplets', title: '1. Source Water Treatment', description: 'Raw water undergoes multiple filtration stages including sand filtration, carbon filtration, and reverse osmosis to remove impurities.' },
        { icon: 'sparkles', title: '2. UV Sterilization', description: 'Water is treated with ultraviolet light to eliminate bacteria, viruses, and other microorganisms without using chemicals.' },
        { icon: 'zap', title: '3. Ozonation', description: 'Ozone treatment provides additional disinfection and helps maintain water freshness throughout the shelf life.' },
        { icon: 'flask', title: '4. Laboratory Testing', description: 'Regular microbiological and chemical analysis ensures every batch meets our stringent quality standards.' },
        { icon: 'factory', title: '5. Automated Bottling', description: 'State-of-the-art automated bottling equipment ensures hygienic packaging in a controlled environment.' },
        { icon: 'checkCircle', title: '6. Quality Control', description: 'Final inspection and quality checks before products are released for distribution.' },
      ],
    }),
    richText(
      [
        heading('Testing Standards'),
        heading('Microbiological Testing', 'h3'),
        bullets([
          'Total Coliform Count: 0 CFU/100ml',
          'E. coli: Not Detected',
          'Total Plate Count: <100 CFU/ml',
          'Yeast and Mold: Not Detected',
        ]),
        heading('Physical & Chemical Testing', 'h3'),
        bullets([
          'pH Level: 6.5 - 8.5',
          'Total Dissolved Solids: <500 mg/L',
          'Turbidity: <1 NTU',
          'Heavy Metals: Within WHO limits',
        ]),
        heading('Our Commitment to Quality'),
        para(
          'At Fizam Table Water, quality is not just a goal—it’s our promise. We are committed to maintaining the highest standards in water purification, bottling, and distribution. Our state-of-the-art facility, experienced quality control team, and rigorous testing protocols ensure that every bottle of Fizam water meets or exceeds national and international quality standards.',
        ),
        para([txt('100% ', true), txt('Quality Tested   ·   '), txt('24/7 ', true), txt('Quality Control   ·   '), txt('4+ ', true), txt('Certifications')]),
        para([
          txt('For verification of our certifications or quality reports, contact us: ', true),
          txt('info@fizamwater.com · 09166698406'),
        ]),
      ],
      'card',
    ),
  ]
}

function privacyLayout(): Lex[] {
  return [
    pageHeader({ title: 'Privacy Policy', subtitle: 'Last updated: December 19, 2024', icon: 'shield' }),
    richText(
      [
        heading('1. Introduction'),
        para(
          'Fizam Table Water ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.',
        ),
        heading('2. Information We Collect'),
        para('We collect information that you provide directly to us, including:'),
        bullets([
          'Name, email address, and phone number',
          'Delivery address and billing information',
          'Order history and preferences',
          'Job application information (resume, cover letter, references)',
          'Account credentials for our online ordering system',
        ]),
        heading('3. How We Use Your Information'),
        para('We use the collected information for the following purposes:'),
        bullets([
          'Process and fulfill your orders',
          'Communicate with you about your orders and deliveries',
          'Respond to your inquiries and provide customer support',
          'Process job applications and recruitment',
          'Improve our products and services',
          'Send you marketing communications (with your consent)',
          'Comply with legal obligations',
        ]),
        heading('4. Information Sharing'),
        para(
          'We do not sell, trade, or rent your personal information to third parties. We may share your information with:',
        ),
        bullets([
          'Delivery partners to fulfill your orders',
          'Payment processors to handle transactions',
          'Service providers who assist our business operations',
          'Legal authorities when required by law',
        ]),
        heading('5. Data Security'),
        para(
          'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.',
        ),
        heading('6. Your Rights'),
        para('You have the right to:'),
        bullets([
          'Access your personal information',
          'Correct inaccurate information',
          'Request deletion of your information',
          'Opt-out of marketing communications',
          'Withdraw consent at any time',
        ]),
        heading('7. Cookies and Tracking'),
        para(
          'We use cookies and similar tracking technologies to improve your browsing experience, analyze website traffic, and personalize content. You can control cookie settings through your browser preferences.',
        ),
        heading('8. Children’s Privacy'),
        para(
          'Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.',
        ),
        heading('9. Changes to This Policy'),
        para(
          'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
        ),
        heading('10. Contact Us'),
        para('If you have any questions about this Privacy Policy, please contact us:'),
        para([txt('Email: ', true), txt('info@fizamwater.com')]),
        para([txt('Phone: ', true), txt('09166698406')]),
        para([
          txt('Address: ', true),
          txt('House 3, Sir Eric Togbe Street, Gbazango Extension, Off Arab Road, Behind Diamond House, Kubwa, Abuja'),
        ]),
      ],
      'card',
    ),
  ]
}

function termsLayout(): Lex[] {
  return [
    pageHeader({ title: 'Terms of Service', subtitle: 'Last updated: December 19, 2024', icon: 'fileCheck' }),
    richText(
      [
        heading('1. Acceptance of Terms'),
        para(
          'By accessing and using the Fizam Table Water website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.',
        ),
        heading('2. Products and Services'),
        para('Fizam Table Water offers the following products and services:'),
        bullets([
          'Sachet water (50cl bags)',
          'Table water bottles (35cl, 50cl, 75cl)',
          'Dispenser water (19 litres)',
          'Retail, wholesale, and home delivery services',
          'Direct factory sales',
        ]),
        heading('3. Orders and Payments'),
        pBold('3.1 Placing Orders: ', 'Orders can be placed through our website, phone, or at our factory location. All orders are subject to availability and acceptance.'),
        pBold('3.2 Pricing: ', 'All prices are listed in Nigerian Naira (₦) and are subject to change without notice. The price charged will be the price displayed at the time of order placement.'),
        pBold('3.3 Payment: ', 'We accept secure online payments through Paystack (card, bank transfer, USSD), as well as cash on delivery for select areas. Payment must be received before delivery for home delivery orders.'),
        pBold('3.4 Minimum Order: ', 'Minimum order quantities may apply for wholesale and home delivery orders.'),
        heading('4. Delivery'),
        pBold('4.1 Delivery Areas: ', 'We deliver within Abuja and surrounding areas. Delivery fees may apply based on location and order size.'),
        pBold('4.2 Delivery Time: ', 'We strive to deliver within the estimated timeframe provided at checkout. Delivery times are estimates and not guaranteed.'),
        pBold('4.3 Failed Delivery: ', 'If delivery cannot be completed due to incorrect address or unavailability, additional delivery charges may apply for redelivery attempts.'),
        heading('5. Returns and Refunds'),
        pBold('5.1 Product Quality: ', 'We guarantee the quality and safety of our products. If you receive a defective or contaminated product, please contact us immediately.'),
        pBold('5.2 Returns: ', 'Defective products may be returned within 24 hours of delivery with proof of purchase. Products must be unopened and in original packaging.'),
        pBold('5.3 Refunds: ', 'Approved returns will be refunded through the original payment method within 7-14 business days.'),
        heading('6. Product Quality and Safety'),
        para(
          'All our products meet NAFDAC standards and other relevant quality certifications. We maintain strict quality control processes to ensure the purity and safety of our water products.',
        ),
        heading('7. User Accounts'),
        pBold('7.1 Account Creation: ', 'You may create an account to access certain features of our services. You are responsible for maintaining the confidentiality of your account credentials.'),
        pBold('7.2 Account Security: ', 'You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use.'),
        heading('8. Intellectual Property'),
        para(
          'All content on this website, including text, graphics, logos, and images, is the property of Fizam Table Water and protected by intellectual property laws. Unauthorized use is prohibited.',
        ),
        heading('9. Limitation of Liability'),
        para(
          'Fizam Table Water shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services. Our liability is limited to the amount paid for the product or service.',
        ),
        heading('10. Termination'),
        para(
          'We reserve the right to terminate or suspend access to our services immediately, without prior notice, for any reason, including breach of these Terms of Service.',
        ),
        heading('11. Governing Law'),
        para(
          'These Terms of Service are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Abuja, Nigeria.',
        ),
        heading('12. Changes to Terms'),
        para(
          'We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting on this page. Your continued use of our services constitutes acceptance of the modified terms.',
        ),
        heading('13. Contact Information'),
        para('For questions about these Terms of Service, please contact us:'),
        para([txt('Email: ', true), txt('info@fizamwater.com')]),
        para([txt('Phone: ', true), txt('09166698406, 07039027061, 09158293282, 07039032093')]),
        para([
          txt('Address: ', true),
          txt('House 3, Sir Eric Togbe Street, Gbazango Extension, Off Arab Road, Behind Diamond House, Kubwa, Abuja'),
        ]),
      ],
      'card',
    ),
  ]
}

/* -------------------------------------------------------------------------- */
/*  Seeder                                                                     */
/* -------------------------------------------------------------------------- */

export async function seedContentPages(payload: Payload): Promise<void> {
  const factoryImageId = await ensureMedia(payload, 'images/factory.png', 'Fizam Table Water production facility')

  const pages: {
    slug: string
    title: string
    metaTitle: string
    metaDescription: string
    keywords?: string
    layout: Lex[]
  }[] = [
    {
      slug: 'about',
      title: 'About Us',
      metaTitle: 'About Fizam — Alfurat Nigeria Limited',
      metaDescription:
        'About Fizam Table Water (fizam.ng) by Alfurat Nigeria Limited — premium bottled & sachet water, reverse osmosis purification, serving FCT and Nigeria.',
      keywords: 'Fizam, fizam.ng, About Fizam, Alfurat Nigeria Limited, Fizam Table Water',
      layout: aboutLayout(factoryImageId),
    },
    {
      slug: 'quality-certifications',
      title: 'Quality Certifications',
      metaTitle: 'Quality & NAFDAC Certifications | Fizam Table Water',
      metaDescription:
        'Fizam Table Water quality certifications: NAFDAC registration, ISO-aligned processes, and lab-tested purity for Nigerian consumers.',
      layout: qualityLayout(),
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      metaTitle: 'Privacy Policy | Fizam Table Water',
      metaDescription: 'Privacy policy for Fizam Table Water (fizam.ng) — how we collect and protect your data.',
      layout: privacyLayout(),
    },
    {
      slug: 'terms-of-service',
      title: 'Terms of Service',
      metaTitle: 'Terms of Service | Fizam Table Water',
      metaDescription: 'Terms of service for ordering Fizam Table Water at fizam.ng.',
      layout: termsLayout(),
    },
  ]

  for (const page of pages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) continue

    await payload.create({
      collection: 'pages',
      data: {
        title: page.title,
        slug: page.slug,
        status: 'published',
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        keywords: page.keywords,
        layout: page.layout,
      } as never,
      overrideAccess: true,
    })
    console.log(`Seeded page: /${page.slug}`)
  }
}

import type { Metadata } from 'next'
import { Award, CheckCircle, Shield, Droplet } from 'lucide-react'
import { SimpleNavbar } from '@/components/frontend/SimpleNavbar'
import { Footer } from '@/components/frontend/Footer'
import { BackToTop } from '@/components/frontend/BackToTop'

export const metadata: Metadata = {
  title: 'Quality Certifications — Fizam Table Water',
}

const certifications = [
  {
    title: 'NAFDAC Certified',
    description:
      'Our products are registered and certified by the National Agency for Food and Drug Administration and Control (NAFDAC), ensuring compliance with all national safety and quality standards.',
    icon: Shield,
    number: 'Reg. No: NAFDAC-XXXXXX',
  },
  {
    title: 'SON Certified',
    description:
      'Certified by the Standards Organisation of Nigeria (SON) for meeting the mandatory standards for packaged drinking water in Nigeria.',
    icon: Award,
    number: 'SON Cert. No: XXXXX',
  },
  {
    title: 'ISO 9001:2015',
    description:
      'Our quality management system is certified to ISO 9001:2015 standards, demonstrating our commitment to consistent quality and continuous improvement.',
    icon: CheckCircle,
    number: 'ISO 9001:2015',
  },
  {
    title: 'Water Quality Standards',
    description:
      'Our products meet and exceed WHO guidelines for drinking water quality, with regular laboratory testing to ensure purity and safety.',
    icon: Droplet,
    number: 'WHO Compliant',
  },
] as const

const qualityProcess = [
  {
    step: '1',
    title: 'Source Water Treatment',
    description:
      'Raw water undergoes multiple filtration stages including sand filtration, carbon filtration, and reverse osmosis to remove impurities.',
  },
  {
    step: '2',
    title: 'UV Sterilization',
    description:
      'Water is treated with ultraviolet light to eliminate bacteria, viruses, and other microorganisms without using chemicals.',
  },
  {
    step: '3',
    title: 'Ozonation',
    description:
      'Ozone treatment provides additional disinfection and helps maintain water freshness throughout the shelf life.',
  },
  {
    step: '4',
    title: 'Laboratory Testing',
    description:
      'Regular microbiological and chemical analysis ensures every batch meets our stringent quality standards.',
  },
  {
    step: '5',
    title: 'Automated Bottling',
    description:
      'State-of-the-art automated bottling equipment ensures hygienic packaging in a controlled environment.',
  },
  {
    step: '6',
    title: 'Quality Control',
    description: 'Final inspection and quality checks before products are released for distribution.',
  },
]

export default function QualityCertificationsPage() {
  return (
    <>
      <SimpleNavbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] rounded-full mb-6">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl text-[#1a1f71] mb-4">Quality Certifications</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Committed to excellence in every drop. Our certifications demonstrate our dedication
              to providing safe, pure, and high-quality water products.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] rounded-lg flex items-center justify-center">
                    <cert.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl text-[#1a1f71] mb-2">{cert.title}</h3>
                    <p className="text-sm text-[#2563eb]">{cert.number}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{cert.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
            <h2 className="text-3xl text-[#1a1f71] mb-8 text-center">Our Quality Process</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qualityProcess.map((process, index) => (
                <div key={index} className="relative">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] rounded-full flex items-center justify-center text-white">
                      {process.step}
                    </div>
                    <div>
                      <h4 className="text-lg text-[#1a1f71] mb-2">{process.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{process.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#1a1f71] to-[#2563eb] rounded-2xl shadow-lg p-8 md:p-12 text-white mb-16">
            <h2 className="text-3xl mb-6 text-center">Testing Standards</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl mb-4">Microbiological Testing</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Total Coliform Count: 0 CFU/100ml</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>E. coli: Not Detected</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Total Plate Count: {'<'}100 CFU/ml</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Yeast and Mold: Not Detected</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl mb-4">Physical &amp; Chemical Testing</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>pH Level: 6.5 - 8.5</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Total Dissolved Solids: {'<'}500 mg/L</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Turbidity: {'<'}1 NTU</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Heavy Metals: Within WHO limits</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl text-[#1a1f71] mb-6">Our Commitment to Quality</h2>
            <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8">
              At Fizam Table Water, quality is not just a goal—it&apos;s our promise. We are
              committed to maintaining the highest standards in water purification, bottling, and
              distribution. Our state-of-the-art facility, experienced quality control team, and
              rigorous testing protocols ensure that every bottle of Fizam water meets or exceeds
              national and international quality standards.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-gray-50 rounded-lg px-6 py-4">
                <p className="text-3xl text-[#2563eb]">100%</p>
                <p className="text-gray-600">Quality Tested</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-6 py-4">
                <p className="text-3xl text-[#2563eb]">24/7</p>
                <p className="text-gray-600">Quality Control</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-6 py-4">
                <p className="text-3xl text-[#2563eb]">4+</p>
                <p className="text-gray-600">Certifications</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              For verification of our certifications or quality reports, please contact us:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="mailto:info@fizamwater.com" className="text-[#2563eb] hover:underline">
                info@fizamwater.com
              </a>
              <span className="text-gray-400">|</span>
              <a href="tel:+2349166698406" className="text-[#2563eb] hover:underline">
                09166698406
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <BackToTop />
    </>
  )
}

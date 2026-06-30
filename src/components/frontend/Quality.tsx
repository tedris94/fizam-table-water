import { Award } from 'lucide-react'
import { getIcon } from '@/components/frontend/blocks/icons'

type Certification = { icon?: string | null; title: string; description?: string | null }
type Step = { value: string }

type QualityProps = {
  badge?: string | null
  heading?: string | null
  subheading?: string | null
  certifications?: Certification[] | null
  processHeading?: string | null
  steps?: Step[] | null
  guaranteeTitle?: string | null
  guaranteeBody?: string | null
  statValue?: string | null
  statLabel?: string | null
}

const DEFAULT_CERTS: Certification[] = [
  { icon: 'flask', title: 'Laboratory Tested', description: 'Regular testing ensures consistent quality and purity' },
  { icon: 'award', title: 'Industry Standards', description: 'Meets and exceeds all regulatory requirements' },
  { icon: 'fileCheck', title: 'Quality Certified', description: 'Certified by relevant health and safety authorities' },
  { icon: 'checkCircle', title: 'Safe & Pure', description: 'Multi-stage purification for your peace of mind' },
]

const DEFAULT_STEPS: Step[] = [
  { value: 'Source selection from pristine water sources' },
  { value: 'Multi-stage filtration and purification' },
  { value: 'Rigorous laboratory testing' },
  { value: 'Quality control at every production stage' },
  { value: 'Hygienic packaging and sealing' },
  { value: 'Regular safety and compliance audits' },
]

export function Quality({
  badge = 'Quality Assurance',
  heading = 'Ensuring Purity & Great Taste',
  subheading = 'Our commitment to quality means every drop meets the highest standards',
  certifications,
  processHeading = 'Our Quality Process',
  steps,
  guaranteeTitle = 'Quality Guaranteed',
  guaranteeBody = 'Every bottle of Fizam Table Water comes with our quality assurance promise. We are committed to delivering pure, safe, and great-tasting water to every customer.',
  statValue = '100%',
  statLabel = 'Quality Certified',
}: QualityProps) {
  const certs = certifications && certifications.length > 0 ? certifications : DEFAULT_CERTS
  const processSteps = steps && steps.length > 0 ? steps : DEFAULT_STEPS
  const CheckIcon = getIcon('checkCircle')

  return (
    <section id="quality" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          {badge && (
            <div className="inline-block bg-blue-100 text-[#1a1f71] px-4 py-2 rounded-full mb-4">{badge}</div>
          )}
          <h2 className="text-4xl md:text-5xl text-[#1a1f71] mb-4">{heading}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subheading}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {certs.map((cert, index) => {
            const Icon = getIcon(cert.icon)
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#1a1f71] to-[#2563eb] rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl text-[#1a1f71] mb-3">{cert.title}</h3>
                <p className="text-gray-600">{cert.description}</p>
              </div>
            )
          })}
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl text-[#1a1f71] mb-6">{processHeading}</h3>
              <div className="space-y-4">
                {processSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckIcon className="w-6 h-6 text-[#2563eb] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{step.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#1a1f71] to-[#2563eb] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-12 h-12 text-white" />
                </div>
                <h4 className="text-2xl text-[#1a1f71] mb-4">{guaranteeTitle}</h4>
                <p className="text-gray-600 mb-6">{guaranteeBody}</p>
                <div className="text-5xl text-[#2563eb]">{statValue}</div>
                <div className="text-gray-600 mt-2">{statLabel}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

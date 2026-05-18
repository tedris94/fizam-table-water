import { FileText } from 'lucide-react'
import { buildPageMetadata, titleWithBrand } from '@/lib/seo'
import { SimpleNavbar } from '@/components/frontend/SimpleNavbar'
import { Footer } from '@/components/frontend/Footer'
import { BackToTop } from '@/components/frontend/BackToTop'

export const metadata = buildPageMetadata({
  title: titleWithBrand('Terms of Service'),
  description: 'Terms of service for ordering Fizam Table Water at fizam.ng.',
  path: '/terms-of-service',
  noIndex: true,
})

export default function TermsOfServicePage() {
  return (
    <>
      <SimpleNavbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] rounded-full mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl text-[#1a1f71] mb-4">Terms of Service</h1>
            <p className="text-gray-600">Last updated: December 19, 2024</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using the Fizam Table Water website and services, you agree to be
                bound by these Terms of Service. If you do not agree to these terms, please do not
                use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">2. Products and Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Fizam Table Water offers the following products and services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Sachet water (30cl bags)</li>
                <li>Table water bottles (50cl, 75cl)</li>
                <li>Dispensible water bottles (various sizes)</li>
                <li>Retail, wholesale, and home delivery services</li>
                <li>Direct factory sales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">3. Orders and Payments</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>3.1 Placing Orders:</strong> Orders can be placed through our website,
                phone, or at our factory location. All orders are subject to availability and
                acceptance.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>3.2 Pricing:</strong> All prices are listed in Nigerian Naira (₦) and are
                subject to change without notice. The price charged will be the price displayed at
                the time of order placement.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>3.3 Payment:</strong> We accept secure online payments through Paystack
                (card, bank transfer, USSD), as well as cash on delivery for select areas. Payment
                must be received before delivery for home delivery orders.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>3.4 Minimum Order:</strong> Minimum order quantities may apply for
                wholesale and home delivery orders.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">4. Delivery</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>4.1 Delivery Areas:</strong> We deliver within Abuja and surrounding areas.
                Delivery fees may apply based on location and order size.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>4.2 Delivery Time:</strong> We strive to deliver within the estimated
                timeframe provided at checkout. Delivery times are estimates and not guaranteed.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>4.3 Failed Delivery:</strong> If delivery cannot be completed due to
                incorrect address or unavailability, additional delivery charges may apply for
                redelivery attempts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">5. Returns and Refunds</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>5.1 Product Quality:</strong> We guarantee the quality and safety of our
                products. If you receive a defective or contaminated product, please contact us
                immediately.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>5.2 Returns:</strong> Defective products may be returned within 24 hours of
                delivery with proof of purchase. Products must be unopened and in original
                packaging.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>5.3 Refunds:</strong> Approved returns will be refunded through the
                original payment method within 7-14 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">6. Product Quality and Safety</h2>
              <p className="text-gray-700 leading-relaxed">
                All our products meet NAFDAC standards and other relevant quality certifications.
                We maintain strict quality control processes to ensure the purity and safety of
                our water products.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">7. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>7.1 Account Creation:</strong> You may create an account to access certain
                features of our services. You are responsible for maintaining the confidentiality
                of your account credentials.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>7.2 Account Security:</strong> You are responsible for all activities that
                occur under your account. Notify us immediately of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All content on this website, including text, graphics, logos, and images, is the
                property of Fizam Table Water and protected by intellectual property laws.
                Unauthorized use is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                Fizam Table Water shall not be liable for any indirect, incidental, special, or
                consequential damages arising from the use of our products or services. Our
                liability is limited to the amount paid for the product or service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">10. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to terminate or suspend access to our services immediately,
                without prior notice, for any reason, including breach of these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">11. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Service are governed by the laws of the Federal Republic of
                Nigeria. Any disputes shall be resolved in the courts of Abuja, Nigeria.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be
                effective immediately upon posting on this page. Your continued use of our services
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">13. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                <p className="text-gray-700">
                  <strong>Email:</strong> info@fizamwater.com
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> 09166698406, 07039027061, 09158293282, 07039032093
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> House 3, Sir Eric Togbe Street, Gbazango Extension, Off
                  Arab Road, Behind Diamond House, Kubwa, Abuja
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
      <BackToTop />
    </>
  )
}

import { Shield } from 'lucide-react'
import { buildPageMetadata, titleWithBrand } from '@/lib/seo'
import { SimpleNavbar } from '@/components/frontend/SimpleNavbar'
import { Footer } from '@/components/frontend/Footer'
import { BackToTop } from '@/components/frontend/BackToTop'

export const metadata = buildPageMetadata({
  title: titleWithBrand('Privacy Policy'),
  description: 'Privacy policy for Fizam Table Water (fizam.ng) — how we collect and protect your data.',
  path: '/privacy-policy',
  noIndex: true,
})

export default function PrivacyPolicyPage() {
  return (
    <>
      <SimpleNavbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] rounded-full mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl text-[#1a1f71] mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: December 19, 2024</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Fizam Table Water (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed
                to protecting your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you visit our website or use our
                services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">2. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Delivery address and billing information</li>
                <li>Order history and preferences</li>
                <li>Job application information (resume, cover letter, references)</li>
                <li>Account credentials for our online ordering system</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and deliveries</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Process job applications and recruitment</li>
                <li>Improve our products and services</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">4. Information Sharing</h2>
              <p className="text-gray-700 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may
                share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                <li>Delivery partners to fulfill your orders</li>
                <li>Payment processors to handle transactions</li>
                <li>Service providers who assist our business operations</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect
                your personal information against unauthorized access, alteration, disclosure, or
                destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">6. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar tracking technologies to improve your browsing
                experience, analyze website traffic, and personalize content. You can control
                cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">8. Children&apos;s Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not directed to individuals under the age of 18. We do not
                knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the &quot;Last
                updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a1f71] mb-4">10. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                <p className="text-gray-700">
                  <strong>Email:</strong> info@fizamwater.com
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> 09166698406
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

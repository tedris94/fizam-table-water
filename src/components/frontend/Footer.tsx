import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, type LucideIcon } from 'lucide-react';
import { Logo } from '@/components/frontend/Logo';
import { ObfuscatedEmail } from '@/components/frontend/ObfuscatedEmail';
import { ENCODED_EMAILS } from '@/lib/obfuscateEmail';
import { getFooterData } from '@/lib/site-chrome';

const DEFAULT_ABOUT =
  'Quality certified table water ensuring purity and great taste in every drop. Your trusted source for refreshingly pure water.';

const DEFAULT_COLUMNS = [
  {
    title: 'Our Products',
    links: [
      { label: 'Sachet Water (50cl)', href: '/#product-sachet-water-50cl' },
      { label: 'Table Water (35cl)', href: '/#product-table-water-35cl' },
      { label: 'Table Water (50cl)', href: '/#product-table-water-50cl' },
      { label: 'Table Water (75cl)', href: '/#product-table-water-75cl' },
      { label: 'Dispenser (19L)', href: '/#product-dispenser-19l' },
    ],
  },
  {
    title: 'How to Buy',
    links: [
      { label: 'Retail Stores', href: '#sales' },
      { label: 'Wholesale Orders', href: '#sales' },
      { label: 'Direct from Factory', href: '#sales' },
      { label: 'Home Delivery', href: '#sales' },
    ],
  },
];

const DEFAULT_PHONES = [
  { label: '09166698406', href: 'tel:+2349166698406' },
  { label: '07039027061', href: 'tel:+2347039027061' },
  { label: '09158293282', href: 'tel:+2349158293282' },
  { label: '07039032093', href: 'tel:+2347039032093' },
];

const DEFAULT_ADDRESS =
  'House 3, Sir Eric Togbe Street, Gbazango Extension, Off Arab Road, Behind Diamond House, Kubwa, Abuja';

const DEFAULT_LEGAL = [
  { label: 'About us', href: '/about' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Quality Certifications', href: '/quality-certifications' },
];

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
};

const DEFAULT_SOCIALS = [
  { platform: 'facebook', href: '#' },
  { platform: 'instagram', href: '#' },
  { platform: 'twitter', href: '#' },
];

export async function Footer() {
  const data = await getFooterData();
  const currentYear = new Date().getFullYear();

  const about = data?.about || DEFAULT_ABOUT;
  const columns =
    data?.columns && data.columns.length > 0
      ? data.columns.map((c) => ({ title: c.title, links: c.links ?? [] }))
      : DEFAULT_COLUMNS;
  const phones =
    data?.contact?.phones && data.contact.phones.length > 0 ? data.contact.phones : DEFAULT_PHONES;
  const email = data?.contact?.email || null;
  const address = data?.contact?.address || DEFAULT_ADDRESS;
  const socials = data?.socials && data.socials.length > 0 ? data.socials : DEFAULT_SOCIALS;
  const legalLinks = data?.legalLinks && data.legalLinks.length > 0 ? data.legalLinks : DEFAULT_LEGAL;
  const copyright =
    data?.copyright || `© ${currentYear} Fizam Table Water. All rights reserved.`;

  return (
    <footer className="bg-gradient-to-br from-[#1a1f71] to-[#0f1545] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <a href="/" className="inline-flex items-center mb-6" aria-label="Fizam Table Water — Home">
              <Logo variant="light" className="h-24 md:h-32 w-auto" />
            </a>
            <p className="text-blue-200 mb-6">{about}</p>
            <div className="flex gap-4">
              {socials.map((social, index) => {
                const Icon = SOCIAL_ICONS[social.platform ?? ''] ?? Facebook;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((column, index) => (
            <div key={index}>
              <h4 className="text-xl mb-6">{column.title}</h4>
              <ul className="space-y-3 text-blue-200">
                {(column.links ?? []).map((link, idx) => (
                  <li key={idx}>
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-xl mb-6">Contact Us</h4>
            <div className="space-y-4 text-blue-200">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  {phones.map((phone, index) => (
                    <a key={index} href={phone.href ?? undefined} className="hover:text-white transition-colors">
                      {phone.label}
                    </a>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                {email ? (
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                    {email}
                  </a>
                ) : (
                  <ObfuscatedEmail
                    encoded={ENCODED_EMAILS.infoFizamWater}
                    className="hover:text-white transition-colors"
                  />
                )}
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-blue-200 text-sm">{copyright}</p>
            <div className="flex gap-6 text-sm text-blue-200">
              {legalLinks.map((link, index) => (
                <a key={index} href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

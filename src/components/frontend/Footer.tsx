import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '@/components/frontend/Logo';
import { ObfuscatedEmail } from '@/components/frontend/ObfuscatedEmail';
import { ENCODED_EMAILS } from '@/lib/obfuscateEmail';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-[#1a1f71] to-[#0f1545] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <a
              href="/"
              className="inline-flex items-center mb-6"
              aria-label="Fizam Table Water — Home"
            >
              <Logo variant="light" className="h-24 md:h-32 w-auto" />
            </a>
            <p className="text-blue-200 mb-6">
              Quality certified table water ensuring purity and great taste in every drop. 
              Your trusted source for refreshingly pure water.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-xl mb-6">Our Products</h4>
            <ul className="space-y-3 text-blue-200">
              <li>
                <a href="/#product-sachet-water-50cl" className="hover:text-white transition-colors">
                  Sachet Water (50cl)
                </a>
              </li>
              <li>
                <a href="/#product-table-water-35cl" className="hover:text-white transition-colors">
                  Table Water (35cl)
                </a>
              </li>
              <li>
                <a href="/#product-table-water-50cl" className="hover:text-white transition-colors">
                  Table Water (50cl)
                </a>
              </li>
              <li>
                <a href="/#product-table-water-75cl" className="hover:text-white transition-colors">
                  Table Water (75cl)
                </a>
              </li>
           
              <li>
                <a
                  href="/#product-dispenser-19l"
                  className="hover:text-white transition-colors"
                >
                  Dispenser (19L)
                </a>
              </li>
            </ul>
          </div>

          {/* Sales Channels */}
          <div>
            <h4 className="text-xl mb-6">How to Buy</h4>
            <ul className="space-y-3 text-blue-200">
              <li><a href="#sales" className="hover:text-white transition-colors">Retail Stores</a></li>
              <li><a href="#sales" className="hover:text-white transition-colors">Wholesale Orders</a></li>
              <li><a href="#sales" className="hover:text-white transition-colors">Direct from Factory</a></li>
              <li><a href="#sales" className="hover:text-white transition-colors">Home Delivery</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl mb-6">Contact Us</h4>
            <div className="space-y-4 text-blue-200">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+2349166698406" className="hover:text-white transition-colors">09166698406</a>
                  <a href="tel:+2347039027061" className="hover:text-white transition-colors">07039027061</a>
                  <a href="tel:+2349158293282" className="hover:text-white transition-colors">09158293282</a>
                  <a href="tel:+2347039032093" className="hover:text-white transition-colors">07039032093</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <ObfuscatedEmail
                  encoded={ENCODED_EMAILS.infoFizamWater}
                  className="hover:text-white transition-colors"
                />
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>House 3, Sir Eric Togbe Street, Gbazango Extension, Off Arab Road, Behind Diamond House, Kubwa, Abuja</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-blue-200 text-sm">
              © {currentYear} Fizam Table Water. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-blue-200">
              <a href="/about" className="hover:text-white transition-colors">About us</a>
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/quality-certifications" className="hover:text-white transition-colors">Quality Certifications</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
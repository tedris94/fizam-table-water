'use client'

import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import { ObfuscatedEmail } from '@/components/frontend/ObfuscatedEmail';
import { ENCODED_EMAILS } from '@/lib/obfuscateEmail';

type ContactProps = {
  heading?: string | null
  subheading?: string | null
  phone?: string | null
  phoneHref?: string | null
  email?: string | null
  address?: string | null
  hours?: string | null
  whyTitle?: string | null
  whyItems?: { value: string }[] | null
}

const DEFAULT_WHY: { value: string }[] = [
  { value: 'Quality certified products' },
  { value: 'Competitive wholesale pricing' },
  { value: 'Reliable delivery service' },
  { value: 'Flexible order quantities' },
  { value: 'Dedicated customer support' },
  { value: 'Fresh production guaranteed' },
]

export function Contact({
  heading = 'Get in Touch',
  subheading = "Have questions or ready to place an order? We'd love to hear from you",
  phone = '+234 703 902 7061',
  phoneHref = 'tel:+2347039027061',
  email,
  address = 'House 3, Sir Eric Togbe Street, Gbazango Extension, Off Arab Road, Behind Diamond House, Kubwa, Abuja',
  hours = 'Mon - Sat: 8:00 AM - 6:00 PM',
  whyTitle = 'Why Order from Fizam?',
  whyItems,
}: ContactProps = {}) {
  const whyList = whyItems && whyItems.length > 0 ? whyItems : DEFAULT_WHY
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderType: 'retail',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        throw new Error(data.error || 'Could not send message. Please try again.')
      }
      setStatus('sent')
      setFormData({
        name: '',
        email: '',
        phone: '',
        orderType: 'retail',
        message: '',
      })
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-[#1a1f71] mb-4">
            {heading}
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            {subheading}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <div className="mb-6">
              <h3 className="text-xl text-[#1a1f71] mb-5">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1a1f71] to-[#2563eb] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm mb-1">Phone</div>
                    <a href={phoneHref ?? undefined} className="text-lg text-[#1a1f71] hover:text-[#2563eb]">
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1a1f71] to-[#2563eb] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm mb-1">Email</div>
                    {email ? (
                      <a href={`mailto:${email}`} className="text-lg text-[#1a1f71] hover:text-[#2563eb]">
                        {email}
                      </a>
                    ) : (
                      <ObfuscatedEmail
                        encoded={ENCODED_EMAILS.infoFizamNg}
                        className="text-lg text-[#1a1f71] hover:text-[#2563eb]"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1a1f71] to-[#2563eb] rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm mb-1">Factory Location</div>
                    <p className="text-lg text-[#1a1f71]">
                    {address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1a1f71] to-[#2563eb] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm mb-1">Business Hours</div>
                    <p className="text-lg text-[#1a1f71]">
                      {hours}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border-2 border-blue-100">
              <h4 className="text-lg text-[#1a1f71] mb-3">
                {whyTitle}
              </h4>
              <ul className="space-y-2">
                {whyList.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-[#2563eb] rounded-full"></div>
                    {item.value}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-100">
            <h3 className="text-xl text-[#1a1f71] mb-5">
              Send us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm text-gray-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                  placeholder="Enter your name"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm text-gray-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="orderType" className="block text-sm text-gray-700 mb-1.5">
                  Order Type
                </label>
                <select
                  id="orderType"
                  name="orderType"
                  value={formData.orderType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors"
                >
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="direct">Direct from Factory</option>
                  <option value="delivery">Home Delivery</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm text-gray-700 mb-1.5">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none transition-colors resize-none"
                  placeholder="Tell us about your requirements..."
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send className="w-5 h-5" />
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
              {status === 'sent' && (
                <p className="text-center text-green-600 text-sm">Thank you! We&apos;ll get back to you soon.</p>
              )}
              {status === 'error' && (
                <p className="text-center text-red-600 text-sm">
                  {errorMessage || 'Something went wrong. Please try again.'}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

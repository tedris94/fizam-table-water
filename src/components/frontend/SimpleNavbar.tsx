'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '@/components/frontend/Logo';
import { useAuth } from '@/contexts/AuthContext';

export function SimpleNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const isLoggedIn = Boolean(user);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label="Fizam Table Water — Home">
            <Logo variant="light" className="h-11 md:h-14 w-auto" />
            <span className="text-xl md:text-2xl font-medium tracking-tight">
              FIZAM Table Water
            </span>
          </a>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="hover:text-blue-200 transition-colors">Home</a>
            <a href="/about" className="hover:text-blue-200 transition-colors">About</a>
            <a href="/order" className="hover:text-blue-200 transition-colors">Order</a>
            <a href="/team" className="hover:text-blue-200 transition-colors">Team</a>
            <a href="/careers" className="hover:text-blue-200 transition-colors">Careers</a>
            {!loading && isLoggedIn ? (
              <a href="/dashboard" className="bg-white text-[#1a1f71] px-6 py-2 rounded-full hover:bg-blue-50 transition-colors">
                Dashboard
              </a>
            ) : (
              <a href="/login" className="hover:text-blue-200 transition-colors">Login</a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <a href="/" className="block hover:text-blue-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="/about" className="block hover:text-blue-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="/order" className="block hover:text-blue-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>Order</a>
            <a href="/team" className="block hover:text-blue-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>Team</a>
            <a href="/careers" className="block hover:text-blue-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>Careers</a>
            {!loading && isLoggedIn ? (
              <a
                href="/dashboard"
                className="block bg-white text-[#1a1f71] px-6 py-2 rounded-full hover:bg-blue-50 transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </a>
            ) : (
              <a href="/login" className="block hover:text-blue-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>Login</a>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

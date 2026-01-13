// User Navbar Component

'use client';

import { useState } from 'react';

export function UserNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-xl font-bold">Perkx</h1>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/user" className="text-gray-700 hover:text-gray-900">
              Dashboard
            </a>
            <a href="/user/profile" className="text-gray-700 hover:text-gray-900">
              Profile
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a href="/user" className="block py-2 text-gray-700">
              Dashboard
            </a>
            <a href="/user/profile" className="block py-2 text-gray-700">
              Profile
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}

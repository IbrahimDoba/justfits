"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { navbar, mobileMenu, mobileMenuItem } from "@/animations/variants";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, Search, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Men", href: "/men" },
  { label: "Women", href: "/women" },
  { label: "Trending", href: "/trending" },
];

const rightLinks = [
  { label: "Seasonal", href: "/seasonal" },
  { label: "Accessories", href: "/accessories" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      variants={navbar}
      initial="hidden"
      animate="visible"
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200"
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-heading font-semibold uppercase tracking-wide text-gray-900 hover:text-gray-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Logo - Center */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <motion.h1
              className="font-display text-2xl md:text-3xl font-black tracking-widest uppercase text-gray-900"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              JUSTFITS
            </motion.h1>
          </Link>

          {/* Right Nav Links & Actions - Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {rightLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-heading font-semibold uppercase tracking-wide text-gray-900 hover:text-gray-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-2 ml-6">
              <button
                className="p-2 text-gray-900 hover:text-gray-600 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <button
                className="p-2 text-gray-900 hover:text-gray-600 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingBag size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 ml-auto text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        variants={mobileMenu}
        initial="closed"
        animate={mobileMenuOpen ? "open" : "closed"}
        className="lg:hidden fixed inset-0 top-20 bg-white z-40"
      >
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col gap-6">
            {[...navLinks, ...rightLinks].map((link) => (
              <motion.div key={link.href} variants={mobileMenuItem}>
                <Link
                  href={link.href}
                  className="text-2xl font-heading font-bold uppercase tracking-wide text-gray-900 hover:text-[#d4af37] transition-colors block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              variants={mobileMenuItem}
              className="mt-8 flex flex-col gap-4"
            >
              <Button fullWidth variant="primary">
                Sign In
              </Button>
              <Button fullWidth variant="outline">
                Create Account
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}

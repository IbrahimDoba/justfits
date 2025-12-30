"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Instagram, Twitter } from "lucide-react";

const footerLinks = {
  shop: [
    { label: "All Caps", href: "/shop" },
    { label: "BMW Collection", href: "/shop/bmw" },
    { label: "Benz Collection", href: "/shop/benz" },
    { label: "New Arrivals", href: "/shop/new" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
  ],
};

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-black/10">
      {/* Newsletter Section */}
      <div className="container px-6 py-16 md:py-20">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-8">
          <h3 className="font-script text-3xl md:text-4xl italic text-black">
            Join the Drive
          </h3>
          <p className="text-sm font-body text-black/50 max-w-md">
            Subscribe for exclusive drops, early access, and updates on new
            collections.
          </p>

          {/* Newsletter Form */}
          <form className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-lg">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:flex-1 px-5 py-3 bg-black/5 border border-black/10 text-black placeholder:text-black/30 text-sm font-body focus:outline-none focus:border-black/30 transition-colors text-center"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="relative z-10 w-full sm:w-auto px-8 py-3.5 bg-black text-white text-sm font-body font-medium uppercase tracking-wider hover:bg-black/90 transition-colors whitespace-nowrap"
            >
              Subscribe
            </motion.button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="border-t border-black/5">
        <div className="container px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/">
                <h4 className="font-script text-2xl italic text-black mb-4">
                  JustFits
                </h4>
              </Link>
              <p className="text-sm font-body text-black/40 max-w-xs leading-relaxed mb-6">
                Premium car-inspired caps for those who drive with style and
                confidence.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-black/40 hover:text-black transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon size={20} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h5 className="text-sm font-body font-medium uppercase tracking-wider text-black mb-4">
                Shop
              </h5>
              <ul className="space-y-3">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-body text-black/40 hover:text-black transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h5 className="text-sm font-body font-medium uppercase tracking-wider text-black mb-4">
                Company
              </h5>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-body text-black/40 hover:text-black transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-black/5">
        <div className="container px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-body text-black/30 w-full">
            <p>
              &copy; {new Date().getFullYear()} JustFits. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="hover:text-black/50 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-black/50 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

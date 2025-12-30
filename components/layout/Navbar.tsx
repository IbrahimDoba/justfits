"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { navbar, mobileMenu, mobileMenuItem } from "@/animations/variants";
import { ShoppingBag, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      variants={navbar}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-20 px-6">
          {/* Logo - Left */}
          <Link href="/" className="flex-shrink-0">
            <motion.h1
              className="font-script text-2xl md:text-3xl font-medium italic tracking-wide text-black"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              JustFits
            </motion.h1>
          </Link>

          {/* Center Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-body font-medium text-black/70 hover:text-black transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Cart Icon - Right */}
          <div className="hidden md:flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-black/70 hover:text-black transition-colors relative"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                0
              </span>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-black"
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
        className="md:hidden fixed inset-0 top-20 bg-white/95 backdrop-blur-lg z-40"
      >
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col gap-8">
            {navLinks.map((link) => (
              <motion.div key={link.href} variants={mobileMenuItem}>
                <Link
                  href={link.href}
                  className="text-3xl font-script italic text-black/90 hover:text-black transition-colors block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              variants={mobileMenuItem}
              className="pt-8 border-t border-black/10"
            >
              <Link
                href="/cart"
                className="flex items-center gap-3 text-black/70 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingBag size={24} strokeWidth={1.5} />
                <span className="text-lg font-body">Cart (0)</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}

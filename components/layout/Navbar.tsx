"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { navbar, mobileMenu, mobileMenuItem } from "@/animations/variants";
import { ShoppingBag, Menu, X, User, LogOut, Package, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    setUserMenuOpen(false);
  };

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

          {/* Right Icons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 text-black/70 hover:text-black transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={22} strokeWidth={1.5} />
            </Link>

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              className="p-2 text-black/70 hover:text-black transition-colors relative"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-semibold rounded-full flex items-center justify-center"
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </motion.span>
              )}
            </motion.button>

            {/* User Menu */}
            {status === "loading" ? (
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
                      {session.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-black truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User size={18} />
                          My Profile
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Package size={18} />
                          My Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Heart size={18} />
                          Wishlist
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut size={18} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-5 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Link>
            )}
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
              className="pt-8 border-t border-black/10 space-y-6"
            >
              {/* Cart */}
              <button
                className="flex items-center gap-3 text-black/70 hover:text-black transition-colors"
                onClick={() => {
                  setMobileMenuOpen(false);
                  toggleCart();
                }}
              >
                <ShoppingBag size={24} strokeWidth={1.5} />
                <span className="text-lg font-body">Cart ({totalItems})</span>
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="flex items-center gap-3 text-black/70 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart size={24} strokeWidth={1.5} />
                <span className="text-lg font-body">Wishlist</span>
              </Link>

              {/* Auth Links */}
              {status === "loading" ? (
                <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg" />
              ) : session ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 text-black/70 hover:text-black transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={24} strokeWidth={1.5} />
                    <span className="text-lg font-body">My Profile</span>
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 text-black/70 hover:text-black transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package size={24} strokeWidth={1.5} />
                    <span className="text-lg font-body">My Orders</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-3 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <LogOut size={24} strokeWidth={1.5} />
                    <span className="text-lg font-body">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 py-3 px-6 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={20} />
                  Sign In
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}

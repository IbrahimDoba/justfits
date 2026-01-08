"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Settings,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActiveLink = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-100 light-theme">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
        <span className="font-display text-xl tracking-wider">
          JUSTFITS ADMIN
        </span>
        <div className="w-10" />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-gray-900 z-50"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <span className="font-display text-xl text-white tracking-wider">
                  JUSTFITS
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActiveLink(link.href)
                        ? "bg-white text-gray-900"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <link.icon size={20} />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        className="hidden lg:flex fixed left-0 top-0 bottom-0 bg-gray-900 flex-col z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.span
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-display text-xl text-white tracking-wider"
              >
                JUSTFITS
              </motion.span>
            ) : (
              <motion.span
                key="short"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-display text-xl text-white"
              >
                JF
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
              <ChevronLeft size={20} />
            </motion.div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActiveLink(link.href)
                  ? "bg-white text-gray-900"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <link.icon size={20} />
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium whitespace-nowrap overflow-hidden"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <User size={16} className="text-gray-400" />
            </div>
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="text-sm text-white font-medium truncate">
                    {session?.user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session?.user?.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full ${
              !sidebarOpen ? "justify-center" : ""
            }`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        } pt-16 lg:pt-0`}
      >
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}

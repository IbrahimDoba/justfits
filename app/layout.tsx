import type { Metadata } from "next";
import {
  Inter,
  Bebas_Neue,
  JetBrains_Mono,
  Playfair_Display,
} from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/components/ui/Toast";
import { CartDrawer } from "@/components/layout/CartDrawer";
import "./globals.css";

// Font Configurations for JUSTFITS Premium Brand
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "900"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Elegant script font for premium headers
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

import { defaultMetadata } from "@/config/siteConfig";

export const metadata: Metadata = defaultMetadata;

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable}`}
    >
      <body className="antialiased">
        <SessionProvider>
          <QueryProvider>
            <ToastProvider>
              <WishlistProvider>
                <CartProvider>
                  {/* <AnnouncementBar /> */}
                  {children}
                  <CartDrawer />
                  {/* WhatsApp sticky floating button — all pages */}
                  <a
                    href="https://wa.me/2348149113328"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat on WhatsApp"
                    className="fixed bottom-6 right-4 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bc5a] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.859L.054 23.25a.75.75 0 00.916.919l5.487-1.461A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.71 9.71 0 01-4.952-1.355l-.355-.21-3.656.974.992-3.573-.228-.368A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                    </svg>
                  </a>
                  <Analytics />
                  <Script
                    src="https://cdn.databuddy.cc/databuddy.js"
                    data-client-id="700dd4bf-06a9-4edc-bbc5-59b9ad17bd10"
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                  />
                </CartProvider>
              </WishlistProvider>
            </ToastProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

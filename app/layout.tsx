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
// Performance: Inter, JetBrains Mono and Playfair are variable fonts, so we
// load one variable file each instead of a separate file per weight. Fonts
// were 247KB on the homepage and their preloads competed with the hero (LCP)
// image on slow phones.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

// Only used for prices below the fold: don't preload it ahead of the hero.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Elegant script font for premium headers
// Every .font-script usage on the site is italic (logo/footer), so only the
// italic variable face is loaded (was 4 weights x 2 styles).
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  style: ["italic"],
});

import { defaultMetadata } from "@/config/siteConfig";

export const metadata: Metadata = defaultMetadata;

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { Tracker } from "@/components/analytics/Tracker";
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
                  {/* Dailzero chat widget — all pages */}
                  <Script id="dailzero-init" strategy="afterInteractive">
                    {`window.dz = window.dz || function(...a){(window.dz.q=window.dz.q||[]).push(a)}
                      dz('init', { publicKey: 'pk_live_e3b6c9dcd34dec05ac4eafd4' })`}
                  </Script>
                  {/* Third parties load when the browser is idle so they don't
                      compete with the hero image on slow connections. */}
                  <Script
                    src="https://staging.dailzero.com/embed/v1.js"
                    strategy="lazyOnload"
                  />
                  <Analytics />
                  {/* First-party analytics -> /admin/analytics */}
                  <Suspense fallback={null}>
                    <Tracker />
                  </Suspense>
                  <Script
                    src="https://cdn.databuddy.cc/databuddy.js"
                    data-client-id="700dd4bf-06a9-4edc-bbc5-59b9ad17bd10"
                    crossOrigin="anonymous"
                    strategy="lazyOnload"
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

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
                  {/* Dailzero chat widget — all pages */}
                  <Script id="dailzero-init" strategy="afterInteractive">
                    {`window.dz = window.dz || function(...a){(window.dz.q=window.dz.q||[]).push(a)}
                      dz('init', { publicKey: 'pk_live_e3b6c9dcd34dec05ac4eafd4' })`}
                  </Script>
                  <Script
                    src="https://staging.dailzero.com/embed/v1.js"
                    strategy="afterInteractive"
                  />
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

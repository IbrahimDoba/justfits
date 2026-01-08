import type { Metadata } from "next";
import { Inter, Bebas_Neue, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
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

export const metadata: Metadata = {
  title: "JUSTFITS - Premium Car-Themed Caps",
  description: "Premium car-themed caps featuring Mercedes-Benz, BMW, Porsche designs. Limited drops, high quality, global appeal.",
  keywords: ["caps", "hats", "car themed", "Mercedes-Benz", "BMW", "Porsche", "premium caps", "luxury streetwear"],
  authors: [{ name: "JUSTFITS" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://justfits.com",
    siteName: "JUSTFITS",
    title: "JUSTFITS - Premium Car-Themed Caps",
    description: "Premium car-themed caps featuring Mercedes-Benz, BMW, Porsche designs.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JUSTFITS - Premium Car-Themed Caps",
    description: "Premium car-themed caps featuring Mercedes-Benz, BMW, Porsche designs.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable}`}>
      <body className="antialiased">
        <SessionProvider>
          <ToastProvider>
            <WishlistProvider>
              <CartProvider>
                {children}
                <CartDrawer />
              </CartProvider>
            </WishlistProvider>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

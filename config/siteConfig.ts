import { Metadata } from "next";

export const siteConfig = {
  name: "JUSTFITS",
  title: "JUSTFITS - Premium Car-Themed Caps",
  description:
    "Premium car-themed caps featuring Mercedes-Benz, BMW, Porsche designs. Limited drops, high quality, global appeal.",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://justfitsng.com",
  ogImage: "/og-image.png",
  links: {
    instagram: "https://instagram.com/justfitsng",
    twitter: "https://twitter.com/justfitsng",
  },
  keywords: [
    "caps",
    "hats",
    "car themed",
    "Mercedes-Benz",
    "BMW",
    "Porsche",
    "premium caps",
    "luxury streetwear",
    "Nigeria fashion",
  ],
};

export const defaultMetadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@justfitsng",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "facebook-domain-verification": "n5rs41a79kuqjrgok8fuav3hp05rva",
  },
};

import { Metadata } from "next";

export const siteConfig = {
  name: "JUSTFITS",
  title: "JUSTFITS Nigeria | F1, Motorsport & Automotive Streetwear",
  description:
    "Shop F1 and motorsport clothing in Nigeria: Ferrari, Mercedes-AMG Petronas, Red Bull Racing and BMW M shirts, polos, hoodies and caps. Nationwide delivery from JUSTFITS.",
  // One consistent brand description (structured data, About page, profiles).
  brandDescription:
    "JUSTFITS is a Nigerian automotive and motorsport streetwear brand selling F1 team shirts, polos, hoodies and caps for fans of Ferrari, Mercedes-AMG Petronas, Red Bull Racing, BMW M and more, with delivery across Nigeria.",
  // Production always uses the real domain so canonicals, sitemap and
  // structured data can never point at a preview or localhost URL.
  url:
    process.env.VERCEL_ENV === "production"
      ? "https://justfitsng.com"
      : process.env.NEXT_PUBLIC_BASE_URL || "https://justfitsng.com",
  ogImage: "/og-image.jpg",
  links: {
    instagram: "https://instagram.com/justfitsng",
    twitter: "https://twitter.com/justfitsng",
  },
  keywords: [
    "F1 clothing Nigeria",
    "motorsport clothing Nigeria",
    "F1 shirts Nigeria",
    "F1 caps Nigeria",
    "Ferrari shirts Nigeria",
    "Mercedes AMG Petronas",
    "BMW Motorsport",
    "Red Bull Racing",
    "automotive streetwear",
    "car caps",
    "Abuja",
    "Lagos",
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
    locale: "en_NG",
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

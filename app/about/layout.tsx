import type { Metadata } from "next";

// The About page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "About Us: Motorsport & Automotive Streetwear in Nigeria",
  description:
    "JUSTFITS is a Nigerian automotive and motorsport streetwear brand: F1 team shirts, polos, hoodies and car caps, delivered anywhere in Nigeria.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

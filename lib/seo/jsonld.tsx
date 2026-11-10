import { siteConfig } from "@/config/siteConfig";

// schema.org structured data. Everything here must match what the page shows.

const base = siteConfig.url.replace(/\/$/, "");
export const absUrl = (path: string) =>
  path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so product text can never close the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export const organizationLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${base}/#organization`,
  name: siteConfig.name,
  url: base,
  logo: absUrl("/android-chrome-512x512.png"),
  description: siteConfig.brandDescription,
  sameAs: [siteConfig.links.instagram],
  areaServed: { "@type": "Country", name: "Nigeria" },
});

export const websiteLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${base}/#website`,
  name: siteConfig.name,
  url: base,
  publisher: { "@id": `${base}/#organization` },
  inLanguage: "en-NG",
});

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: absUrl(it.path),
  })),
});

export const productLd = (p: {
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  inStock: boolean;
  category: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: p.name,
  description: p.description,
  image: p.images.map(absUrl),
  sku: p.slug,
  category: p.category,
  // Sold by JUSTFITS; team names describe the design (see the site FAQ).
  brand: { "@type": "Brand", name: siteConfig.name },
  offers: {
    "@type": "Offer",
    url: absUrl(`/products/${p.slug}`),
    priceCurrency: "NGN",
    price: p.price,
    availability: p.inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@id": `${base}/#organization` },
  },
});

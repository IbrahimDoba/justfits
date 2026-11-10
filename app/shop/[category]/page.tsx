import type { Metadata } from "next";
import { getInventoryListProducts } from "@/lib/shop/catalog-source";
import { SHOP_PAGE_LIMIT } from "@/lib/shop/defaults";
import { queryShopProducts } from "@/lib/shop/list";
import { COLLECTIONS, findCollection, type Collection } from "@/lib/seo/collections";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { CollectionClient } from "./CollectionClient";

// Server-rendered and cached per slug (refreshed every minute), like /shop.
export const revalidate = 60;

type Params = Promise<{ category: string }>;

// Prebuild the curated collections; any other slug (benz, red-bull...) is
// rendered on first visit and then cached the same way.
export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ category: c.slug }));
}

// "red-bull" -> "Red Bull": a readable heading for a brand/keyword view.
function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const relatedLinks = (c: Collection | null) =>
  (c?.related ?? ["f1", "ferrari", "mercedes", "caps"])
    .map((slug) => COLLECTIONS.find((x) => x.slug === slug))
    .filter((x): x is Collection => !!x)
    .map((x) => ({ slug: x.slug, name: x.name }));

async function resolveSlug(slug: string) {
  const collection = findCollection(slug);
  const searchTerm = slug.replace(/-/g, " ").trim();
  const query = collection
    ? { collection: collection.slug, limit: SHOP_PAGE_LIMIT }
    : { search: searchTerm, limit: SHOP_PAGE_LIMIT };
  let products;
  try {
    products = queryShopProducts(await getInventoryListProducts(), query).products;
  } catch (error) {
    // DB unreachable: render the shell and let the client fetch.
    console.error("Collection prerender failed:", error);
  }
  return {
    collection,
    title: collection?.h1 ?? titleFromSlug(slug),
    intro: collection?.intro ?? null,
    collectionSlug: collection?.slug ?? null,
    searchTerm,
    products,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const slug = decodeURIComponent((await params).category);
  const c = findCollection(slug);
  if (!c) {
    // Free-text brand/keyword views stay usable (WhatsApp agent links) but
    // are kept out of the index so they don't compete as thin pages.
    return {
      title: titleFromSlug(slug),
      robots: { index: false, follow: true },
    };
  }
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `/shop/${c.slug}` },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: `/shop/${c.slug}`,
    },
  };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const slug = decodeURIComponent((await params).category);
  const view = await resolveSlug(slug);
  const canonicalSlug = view.collection?.slug ?? slug;
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: view.collection?.name ?? view.title, path: `/shop/${canonicalSlug}` },
        ])}
      />
      <CollectionClient
        title={view.title}
        intro={view.intro}
        collectionSlug={view.collectionSlug}
        searchTerm={view.searchTerm}
        initialProducts={view.products}
        related={relatedLinks(view.collection).filter((r) => r.slug !== canonicalSlug)}
      />
    </>
  );
}

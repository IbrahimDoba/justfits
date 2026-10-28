import type { Metadata } from "next";
import { getInventoryListProducts } from "@/lib/shop/catalog-source";
import { SHOP_PAGE_LIMIT } from "@/lib/shop/defaults";
import { getShopCategories, queryShopProducts } from "@/lib/shop/list";
import { CollectionClient } from "./CollectionClient";

// Server-rendered and cached per slug (refreshed every minute), like /shop.
export const revalidate = 60;

type Params = Promise<{ category: string }>;

// Prebuild the real categories; any other slug (benz, red-bull...) is
// rendered on first visit and then cached the same way.
export function generateStaticParams() {
  return [{ category: "caps" }, { category: "shirts" }];
}

// "red-bull" -> "Red Bull": a readable heading for a brand/keyword view.
function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function resolveSlug(slug: string) {
  const searchTerm = slug.replace(/-/g, " ").trim();
  try {
    const [all, categories] = await Promise.all([
      getInventoryListProducts(),
      getShopCategories(),
    ]);
    const category = categories.find((c) => c.slug === slug && c.slug !== "all");
    const { products } = queryShopProducts(
      all,
      category
        ? { category: category.slug, limit: SHOP_PAGE_LIMIT }
        : { search: searchTerm, limit: SHOP_PAGE_LIMIT }
    );
    return {
      title: category?.name ?? titleFromSlug(slug),
      categorySlug: category?.slug ?? null,
      searchTerm,
      products,
    };
  } catch (error) {
    // DB unreachable: render the shell and let the client fetch.
    console.error("Collection prerender failed:", error);
    return {
      title: titleFromSlug(slug),
      categorySlug: ["caps", "shirts", "other"].includes(slug) ? slug : null,
      searchTerm,
      products: undefined,
    };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { category } = await params;
  return { title: titleFromSlug(decodeURIComponent(category)) };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { category } = await params;
  const view = await resolveSlug(decodeURIComponent(category));
  return (
    <CollectionClient
      title={view.title}
      categorySlug={view.categorySlug}
      searchTerm={view.searchTerm}
      initialProducts={view.products}
    />
  );
}

import type { Metadata } from "next";
import { getInventoryListProducts } from "@/lib/shop/catalog-source";
import { SHOP_DEFAULT_SORT, SHOP_PAGE_LIMIT } from "@/lib/shop/defaults";
import { getShopCategories, queryShopProducts } from "@/lib/shop/list";
import { ShopClient } from "./ShopClient";

// Rendered on the server and cached at the edge, refreshed every minute, so
// the grid (and its first images) is in the HTML instead of waiting for
// JS -> /api/products -> render.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop F1 & Motorsport Clothing, Caps and Shirts",
  description:
    "Shop every JUSTFITS piece: Ferrari, Mercedes-AMG Petronas, Red Bull Racing and BMW M shirts, polos, hoodies and car caps. Delivered across Nigeria.",
  alternates: { canonical: "/shop" },
};

async function loadInitial() {
  try {
    const [all, categories] = await Promise.all([
      getInventoryListProducts(),
      getShopCategories(),
    ]);
    const { products } = queryShopProducts(all, {
      sort: SHOP_DEFAULT_SORT,
      limit: SHOP_PAGE_LIMIT,
    });
    return { products, categories };
  } catch (error) {
    // DB unreachable (e.g. at build time): fall back to client fetching.
    console.error("Shop prerender failed:", error);
    return { products: undefined, categories: undefined };
  }
}

export default async function ShopPage() {
  const { products, categories } = await loadInitial();
  return (
    <ShopClient initialProducts={products} initialCategories={categories} />
  );
}

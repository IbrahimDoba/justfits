import {
  getInventoryCategories,
  getInventoryListProducts,
  type ShopListProduct,
} from "@/lib/shop/catalog-source";
import { matchScore, tokenize } from "@/lib/shop/search";

// Shared filter/sort/paging for the public product list. Used by
// /api/products and by the server-rendered /shop pages, so the first paint
// and later client refetches always agree.

export type PublicListProduct = Omit<ShopListProduct, "hasImage">;

export interface ShopQuery {
  search?: string;
  category?: string;
  featured?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ShopCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export function queryShopProducts(all: ShopListProduct[], q: ShopQuery) {
  const search = (q.search || "").toLowerCase().trim();
  const category = q.category || "all";
  const sortBy = q.sort || "featured";
  const page = q.page || 1;
  const limit = q.limit || 20;

  // Fuzzy, token-based search across name + brand + category (word order and
  // spacing don't matter), ranked so the best matches lead. Powers the
  // /shop/[filter] brand/category landing pages.
  let searchRanked = false;
  if (search) {
    const tokens = tokenize(search);
    if (tokens.length > 0) {
      all = all
        .map((p) => ({
          p,
          score: matchScore(`${p.name} ${p.brand ?? ""} ${p.category}`, tokens),
        }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.p);
      searchRanked = true;
    }
  }
  if (category && category !== "all") {
    all = all.filter((p) => p.categorySlug === category);
  }
  if (q.featured) {
    const flagged = all.filter((p) => p.featured);
    // Fall back to nicely-photographed, in-stock items so the homepage
    // showcase is never empty when nothing is explicitly featured.
    all =
      flagged.length >= limit
        ? flagged
        : [
            ...flagged,
            ...all.filter((p) => !p.featured && p.hasImage && p.inStock),
          ];
  }

  // Sort (copy first: callers may pass a shared array)
  all = [...all];
  switch (sortBy) {
    case "price-low":
      all.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      all.sort((a, b) => b.price - a.price);
      break;
    case "name":
      all.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "featured":
      // Keep search relevance order when a search is driving the list.
      if (!searchRanked) {
        all.sort((a, b) => Number(b.featured) - Number(a.featured));
      }
      break;
    default:
      break;
  }

  const total = all.length;
  const start = (page - 1) * limit;
  const products: PublicListProduct[] = all
    .slice(start, start + limit)
    .map(({ hasImage: _hasImage, ...rest }) => {
      void _hasImage;
      return rest;
    });

  return {
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// All + one entry per inventory category, for the shop filter bar.
export async function getShopCategories(): Promise<ShopCategory[]> {
  const [invCats, invProducts] = await Promise.all([
    getInventoryCategories(),
    getInventoryListProducts(),
  ]);
  return [
    { id: "all", name: "All", slug: "all", productCount: invProducts.length },
    ...invCats.sort((a, b) => a.name.localeCompare(b.name)),
  ];
}

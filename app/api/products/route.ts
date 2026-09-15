import { NextRequest, NextResponse } from "next/server";
import { getInventoryListProducts } from "@/lib/shop/catalog-source";
import { matchScore, tokenize } from "@/lib/shop/search";

export const dynamic = "force-dynamic";

// GET /api/products - Public product list, sourced entirely from inventory
// (single source of truth). Legacy catalog products are no longer listed here
// (their data remains in the DB and old detail links still resolve).
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const category = searchParams.get("category") || "all";
    const featured = searchParams.get("featured") === "true";
    const sortBy = searchParams.get("sort") || "featured";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let all = await getInventoryListProducts();

    // Filters
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
    if (featured) {
      const flagged = all.filter((p) => p.featured);
      // Fall back to nicely-photographed, in-stock items so the homepage
      // showcase is never empty when nothing is explicitly featured.
      all =
        flagged.length >= limit
          ? flagged
          : [
              ...flagged,
              ...all.filter(
                (p) => !p.featured && p.hasImage && p.inStock
              ),
            ];
    }

    // Sort
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
    const paged = all.slice(start, start + limit).map((p) => {
      // strip internal helper field
      const { hasImage: _hasImage, ...rest } = p;
      void _hasImage;
      return rest;
    });

    return NextResponse.json({
      products: paged,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

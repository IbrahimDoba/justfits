import { NextRequest, NextResponse } from "next/server";
import { cachedJson } from "@/lib/shop/cache";
import { getInventoryListProducts } from "@/lib/shop/catalog-source";
import { queryShopProducts } from "@/lib/shop/list";

export const dynamic = "force-dynamic";

// GET /api/products - Public product list, sourced entirely from inventory
// (single source of truth). Legacy catalog products are no longer listed here
// (their data remains in the DB and old detail links still resolve).
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = await getInventoryListProducts();

    return cachedJson(
      queryShopProducts(all, {
        search: searchParams.get("search") || "",
        category: searchParams.get("category") || "all",
        featured: searchParams.get("featured") === "true",
        sort: searchParams.get("sort") || "featured",
        page: parseInt(searchParams.get("page") || "1"),
        limit: parseInt(searchParams.get("limit") || "20"),
      })
    );
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { cachedJson } from "@/lib/shop/cache";
import { getShopCategories } from "@/lib/shop/list";

export const dynamic = "force-dynamic";

// GET /api/categories - Public categories for the shop filter.
// Driven by inventory (single source of truth): All + Caps + Shirts.
export async function GET() {
  try {
    return cachedJson({ categories: await getShopCategories() });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

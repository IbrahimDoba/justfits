import { NextResponse } from "next/server";
import { getInventoryCategories, getInventoryListProducts } from "@/lib/shop/catalog-source";

export const dynamic = "force-dynamic";

// GET /api/categories - Public categories for the shop filter.
// Driven by inventory (single source of truth): All + Caps + Shirts.
export async function GET() {
  try {
    const [invCats, invProducts] = await Promise.all([
      getInventoryCategories(),
      getInventoryListProducts(),
    ]);

    const transformedCategories = [
      { id: "all", name: "All", slug: "all", productCount: invProducts.length },
      ...invCats.sort((a, b) => a.name.localeCompare(b.name)),
    ];

    return NextResponse.json({ categories: transformedCategories });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

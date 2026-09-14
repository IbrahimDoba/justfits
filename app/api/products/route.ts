import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getInventoryListProducts, type ShopListProduct } from "@/lib/shop/catalog-source";

export const dynamic = "force-dynamic";

// GET /api/products - Public product list.
// Sourced from inventory (single source of truth), merged with any legacy
// catalog products whose slug isn't already covered by inventory.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const category = searchParams.get("category") || "all";
    const featured = searchParams.get("featured") === "true";
    const sortBy = searchParams.get("sort") || "featured";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // 1) Inventory-derived products (the source of truth)
    const inventoryProducts = await getInventoryListProducts();
    const invSlugs = new Set(inventoryProducts.map((p) => p.slug));

    // 2) Legacy catalog products not represented in inventory (nothing lost)
    const legacy = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        featured: true,
        category: { select: { name: true, slug: true } },
        variants: {
          where: { isAvailable: true },
          select: { price: true, compareAtPrice: true, stockQuantity: true },
        },
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      },
    });

    const legacyProducts: ShopListProduct[] = legacy
      .filter((p) => !invSlugs.has(p.slug))
      .map((p) => {
        const stock = p.variants.reduce((s, v) => s + v.stockQuantity, 0);
        const prices = p.variants.map((v) => Number(v.price));
        const compare = p.variants.find((v) => v.compareAtPrice)?.compareAtPrice;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: "",
          price: prices.length ? Math.min(...prices) : Number(p.basePrice),
          compareAtPrice: compare ? Number(compare) : null,
          image: p.images[0]?.url || null,
          images: p.images.map((i) => i.url),
          category: p.category.name,
          categorySlug: p.category.slug,
          sizes: [],
          inStock: stock > 0,
          featured: p.featured,
          variants: [],
          hasImage: !!p.images[0]?.url,
        };
      });

    let all = [...inventoryProducts, ...legacyProducts];

    // Filters
    if (search) {
      all = all.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search)
      );
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
        all.sort((a, b) => Number(b.featured) - Number(a.featured));
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

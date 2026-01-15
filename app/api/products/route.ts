import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/products - Public API for listing products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const featured = searchParams.get("featured") === "true";
    const sortBy = searchParams.get("sort") || "featured";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.category = {
        slug: category,
      };
    }

    if (featured) {
      where.featured = true;
    }

    // Build order by
    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (sortBy) {
      case "price-low":
        orderBy = { basePrice: "asc" };
        break;
      case "price-high":
        orderBy = { basePrice: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "featured":
      default:
        orderBy = { featured: "desc" };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          basePrice: true,
          featured: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          // Optimized variant fetching: only get what's needed for min/max calculation
          variants: {
            where: { isAvailable: true },
            select: {
              price: true,
              compareAtPrice: true,
              stockQuantity: true,
              // Minimal data needed to determine "in stock"
            },
          },
          // Optimized image fetching: get only primary image or first one
          images: {
            orderBy: { position: "asc" },
            take: 1, // LIMIT TO 1 IMAGE
            select: {
              url: true,
              isPrimary: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Transform products for frontend
    const transformedProducts = products.map((product) => {
      const primaryImage = product.images[0];
      const totalStock = product.variants.reduce(
        (sum, v) => sum + v.stockQuantity,
        0
      );

      // Calculate price range
      let lowestPrice = Number(product.basePrice);
      let compareAtPrice = null;

      if (product.variants.length > 0) {
        const prices = product.variants.map((v) => Number(v.price));
        lowestPrice = Math.min(...prices);

        // Find compare at price (if any variant has one)
        const variantWithCompare = product.variants.find(
          (v) => v.compareAtPrice
        );
        if (variantWithCompare?.compareAtPrice) {
          compareAtPrice = Number(variantWithCompare.compareAtPrice);
        }
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: "", // Don't send description for list view to save bandwidth
        price: lowestPrice,
        compareAtPrice,
        image: primaryImage?.url || null,
        images: product.images.map((img) => img.url), // Will only be 1
        category: product.category.name,
        categorySlug: product.category.slug,
        sizes: [], // Not needed for list view
        inStock: totalStock > 0,
        featured: product.featured,
        variants: [], // Exclude variants array to save massive bandwidth
      };
    });

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

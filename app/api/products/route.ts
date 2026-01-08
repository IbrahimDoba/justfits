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
        include: {
          category: { select: { name: true, slug: true } },
          variants: {
            where: { isAvailable: true },
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              price: true,
              compareAtPrice: true,
              stockQuantity: true,
            },
          },
          images: {
            orderBy: { position: "asc" },
            select: { url: true, alt: true, isPrimary: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Transform products for frontend
    const transformedProducts = products.map((product) => {
      const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
      const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
      const sizes = [...new Set(product.variants.map((v) => v.size))];
      const lowestPrice = product.variants.length > 0
        ? Math.min(...product.variants.map((v) => Number(v.price)))
        : Number(product.basePrice);
      const compareAtPrice = product.variants.find((v) => v.compareAtPrice)?.compareAtPrice;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: lowestPrice,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        image: primaryImage?.url || null,
        images: product.images.map((img) => img.url),
        category: product.category.name,
        categorySlug: product.category.slug,
        sizes,
        inStock: totalStock > 0,
        featured: product.featured,
        variants: product.variants,
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

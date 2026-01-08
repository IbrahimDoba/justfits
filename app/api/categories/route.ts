import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/categories - Public API for listing categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    // Add "All" category at the beginning
    const allProductsCount = await prisma.product.count({
      where: { isActive: true },
    });

    const transformedCategories = [
      { id: "all", name: "All", slug: "all", productCount: allProductsCount },
      ...categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        productCount: cat._count.products,
      })),
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

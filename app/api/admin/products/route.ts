import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/products - List all products
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      where.isActive = status === "active";
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true } },
          variants: { select: { sku: true, stockQuantity: true, price: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category.name,
        price: Number(product.basePrice),
        compareAtPrice: product.variants[0]?.price
          ? Number(product.variants[0].price)
          : null,
        stock: product.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
        sku: product.variants[0]?.sku || "",
        status: product.isActive ? "active" : "draft",
        image: product.images[0]?.url || null,
      })),
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

// Helper to generate unique SKU
function generateSKU(productName: string, variant: { size: string; color: string }, index: number): string {
  const prefix = productName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 3);
  const colorCode = variant.color ? variant.color.slice(0, 2).toUpperCase() : "XX";
  const sizeCode = variant.size || "OS";
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}-${colorCode}-${sizeCode}-${timestamp}${index}`;
}

// POST /api/admin/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      basePrice,
      compareAtPrice,
      categoryId,
      tags,
      status,
      metaTitle,
      metaDescription,
      variants,
      images,
    } = body;

    // Process variants and auto-generate SKUs if not provided
    const processedVariants = variants.map(
      (v: { size: string; color: string; sku: string; price: number; stock: number }, index: number) => ({
        name: `${name} - ${v.color} ${v.size}`,
        size: v.size,
        color: v.color,
        sku: v.sku?.trim() || generateSKU(name, v, index),
        price: v.price || basePrice,
        stockQuantity: v.stock || 0,
        isAvailable: true,
      })
    );

    // Create product with variants
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        basePrice,
        categoryId,
        isActive: status === "active",
        featured: false,
        metaTitle,
        metaDescription,
        variants: {
          create: processedVariants,
        },
        images: images?.length
          ? {
              create: images.map((url: string, index: number) => ({
                url,
                isPrimary: index === 0,
                position: index,
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
        images: true,
        category: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/products/[slug] - Get a single product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          where: { isAvailable: true },
          select: {
            id: true,
            sku: true,
            name: true,
            size: true,
            color: true,
            price: true,
            compareAtPrice: true,
            stockQuantity: true,
          },
          orderBy: { size: "asc" },
        },
        images: {
          orderBy: { position: "asc" },
          select: { id: true, url: true, alt: true, isPrimary: true },
        },
        reviews: {
          where: { isPublished: true },
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            isVerified: true,
            createdAt: true,
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get related products from same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.category.id,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      include: {
        category: { select: { name: true, slug: true } },
        variants: {
          where: { isAvailable: true },
          select: { price: true, stockQuantity: true, size: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
      },
    });

    // Transform product data
    const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
    const sizes = [...new Set(product.variants.map((v) => v.size))];
    const lowestPrice = product.variants.length > 0
      ? Math.min(...product.variants.map((v) => Number(v.price)))
      : Number(product.basePrice);
    const compareAtPrice = product.variants.find((v) => v.compareAtPrice)?.compareAtPrice;
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: lowestPrice,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      images: product.images.map((img) => img.url),
      category: product.category.name,
      categorySlug: product.category.slug,
      sizes,
      inStock: totalStock > 0,
      featured: product.featured,
      variants: product.variants,
      reviews: product.reviews,
      avgRating,
      reviewCount: product.reviews.length,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
    };

    // Transform related products
    const transformedRelated = relatedProducts.map((p) => {
      const stock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
      const price = p.variants.length > 0
        ? Math.min(...p.variants.map((v) => Number(v.price)))
        : Number(p.basePrice);

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price,
        image: p.images[0]?.url || null,
        category: p.category.name,
        inStock: stock > 0,
        sizes: [...new Set(p.variants.map((v) => v.size))],
      };
    });

    return NextResponse.json({
      product: transformedProduct,
      relatedProducts: transformedRelated,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

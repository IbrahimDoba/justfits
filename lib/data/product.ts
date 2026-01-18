import { prisma } from "@/lib/db/prisma";

export async function getProductBySlug(slug: string) {
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
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) return null;

  // Transform product data (mirroring the API route logic)
  const totalStock = product.variants.reduce(
    (sum, v) => sum + v.stockQuantity,
    0,
  );
  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const lowestPrice =
    product.variants.length > 0
      ? Math.min(...product.variants.map((v) => Number(v.price)))
      : Number(product.basePrice);
  const compareAtPrice = product.variants.find(
    (v) => v.compareAtPrice,
  )?.compareAtPrice;

  // Calculate rating stats
  const ratingDistribution = [0, 0, 0, 0, 0];
  let totalRating = 0;
  product.reviews.forEach((review) => {
    ratingDistribution[review.rating - 1]++;
    totalRating += review.rating;
  });
  const avgRating =
    product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

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
    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
    })),
    reviews: product.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
    avgRating,
    reviewCount: product.reviews.length,
    ratingDistribution,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
  };

  // Get related products
  const relatedProductsRaw = await prisma.product.findMany({
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

  const relatedProducts = relatedProductsRaw.map((p) => {
    const stock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
    const price =
      p.variants.length > 0
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
    };
  });

  return {
    product: transformedProduct,
    relatedProducts,
  };
}

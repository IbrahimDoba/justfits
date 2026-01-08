import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { position: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// Helper to generate unique SKU
function generateSKU(productName: string, color: string, size: string): string {
  const prefix = productName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 3);
  const colorCode = color ? color.slice(0, 2).toUpperCase() : "XX";
  const sizeCode = size || "OS";
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}-${colorCode}-${sizeCode}-${timestamp}`;
}

// PUT /api/admin/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      slug,
      description,
      basePrice,
      categoryId,
      status,
      metaTitle,
      metaDescription,
      variants,
      images,
    } = body;

    // 1. Update basic product info
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        basePrice,
        categoryId,
        isActive: status === "active",
        metaTitle,
        metaDescription,
      },
    });

    // 2. Handle Variants
    if (variants && Array.isArray(variants)) {
      // Get existing variants
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: id },
      });

      const existingIds = existingVariants.map((v) => v.id);
      const incomingIds = variants
        .filter((v: { id?: string }) => v.id && existingIds.includes(v.id))
        .map((v: { id: string }) => v.id);

      // Delete variants that are no longer in the list
      const idsToDelete = existingIds.filter((eid) => !incomingIds.includes(eid));
      if (idsToDelete.length > 0) {
        // Try to delete, if fails due to FK constraint, just mark unavailable
        for (const vid of idsToDelete) {
          try {
            await prisma.productVariant.delete({ where: { id: vid } });
          } catch {
            await prisma.productVariant.update({
              where: { id: vid },
              data: { isAvailable: false, stockQuantity: 0 },
            });
          }
        }
      }

      // Update or create variants
      for (const v of variants as Array<{
        id?: string;
        size: string;
        color: string;
        sku?: string;
        price: number;
        stock: number;
      }>) {
        const isExisting = v.id && existingIds.includes(v.id);

        if (isExisting) {
          // Update existing
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              size: v.size,
              color: v.color,
              sku: v.sku?.trim() || undefined, // Don't overwrite with empty
              price: Number(v.price) || basePrice,
              stockQuantity: Number(v.stock) || 0,
              isAvailable: true,
            },
          });
        } else {
          // Create new
          await prisma.productVariant.create({
            data: {
              productId: id,
              name: `${name} - ${v.color} ${v.size}`,
              size: v.size,
              color: v.color,
              sku: v.sku?.trim() || generateSKU(name, v.color, v.size),
              price: Number(v.price) || basePrice,
              stockQuantity: Number(v.stock) || 0,
              isAvailable: true,
            },
          });
        }
      }
    }

    // 3. Handle Images
    if (images && Array.isArray(images)) {
      // Delete existing images
      await prisma.productImage.deleteMany({ where: { productId: id } });

      // Create new images
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((url: string, index: number) => ({
            productId: id,
            url,
            position: index,
            isPrimary: index === 0,
          })),
        });
      }
    }

    // Fetch updated product with relations
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { position: "asc" } },
      },
    });

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Delete related records first (images, variants)
    await prisma.productImage.deleteMany({ where: { productId: id } });

    // Try to delete variants, mark unavailable if FK constraint
    const variants = await prisma.productVariant.findMany({ where: { productId: id } });
    for (const v of variants) {
      try {
        await prisma.productVariant.delete({ where: { id: v.id } });
      } catch {
        await prisma.productVariant.update({
          where: { id: v.id },
          data: { isAvailable: false, stockQuantity: 0 },
        });
      }
    }

    // Delete product
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

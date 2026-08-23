import type { PrismaClient } from "@prisma/client";

/**
 * Creates an InventoryItem for every catalog Product that doesn't already have
 * one (matched by productId). Idempotent — re-running only adds items for
 * products added since the last run. Existing inventory items are never
 * modified, so manual edits to values are preserved.
 */
export async function syncInventoryFromProducts(prisma: PrismaClient) {
  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
  });

  const linked = await prisma.inventoryItem.findMany({
    where: { productId: { not: null } },
    select: { productId: true },
  });
  const alreadyLinked = new Set(linked.map((i) => i.productId));

  let created = 0;
  for (const p of products) {
    if (alreadyLinked.has(p.id)) continue;

    const quantity = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
    const brand =
      p.variants.find((v) => v.carBrand)?.carBrand || p.category?.name || null;

    await prisma.inventoryItem.create({
      data: {
        name: p.name,
        category: /shirt|polo|tee|jersey/i.test(p.name)
          ? "SHIRT"
          : /cap|hat/i.test(p.name)
            ? "CAP"
            : "OTHER",
        brand,
        sellingPrice: p.basePrice,
        quantity,
        productId: p.id,
        isActive: p.isActive,
      },
    });
    created++;
  }

  return { created, totalProducts: products.length };
}

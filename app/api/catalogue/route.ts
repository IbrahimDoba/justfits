import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/catalogue - PUBLIC read-only catalogue, sourced live from inventory.
// Only active, in-stock items; exposes safe fields (no cost price).
export const dynamic = "force-dynamic";

function toWhatsApp(phone?: string | null): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "2348149113328";
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return "234" + digits.slice(1);
  return digits;
}

export async function GET() {
  try {
    const [items, settings] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: { isActive: true, quantity: { gt: 0 } },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.storeSetting.findUnique({ where: { id: "default" } }).catch(() => null),
    ]);

    // Group by product name (a shirt spans several size rows).
    const map = new Map<
      string,
      {
        name: string;
        brand: string | null;
        category: string;
        imageUrl: string | null;
        prices: number[];
        sizes: { size: string; quantity: number }[];
        totalStock: number;
      }
    >();

    for (const i of items) {
      const g =
        map.get(i.name) ??
        {
          name: i.name,
          brand: i.brand,
          category: i.category,
          imageUrl: null,
          prices: [],
          sizes: [],
          totalStock: 0,
        };
      if (!g.imageUrl && i.imageUrl) g.imageUrl = i.imageUrl;
      if (i.sellingPrice != null) g.prices.push(Number(i.sellingPrice));
      if (i.size) g.sizes.push({ size: i.size, quantity: i.quantity });
      g.totalStock += i.quantity;
      map.set(i.name, g);
    }

    const products = Array.from(map.values()).map((g) => ({
      name: g.name,
      brand: g.brand,
      category: g.category,
      imageUrl: g.imageUrl,
      priceMin: g.prices.length ? Math.min(...g.prices) : null,
      priceMax: g.prices.length ? Math.max(...g.prices) : null,
      sizes: g.sizes.sort((a, b) => a.size.localeCompare(b.size)),
      inStock: g.totalStock > 0,
    }));

    return NextResponse.json({
      products,
      whatsapp: toWhatsApp(settings?.storePhone),
      storeName: settings?.storeName || "JUSTFITS",
    });
  } catch (error) {
    console.error("Catalogue API error:", error);
    return NextResponse.json(
      { error: "Failed to load catalogue" },
      { status: 500 }
    );
  }
}

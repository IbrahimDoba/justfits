import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";

// POST /api/admin/finance/batches/opening { brand }
// One-off: records the stock on the shelf today as an "Opening stock" batch,
// one lot per item at its current cost price. Shelf quantities don't change.
// Items with no cost price are skipped and reported back.
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const brand = body.brand === "CARS" ? "CARS" : "CAPS";
    const exists = await prisma.stockBatch.findFirst({ where: { brand, isOpening: true } });
    if (exists) {
      return NextResponse.json({ error: "Opening stock is already recorded" }, { status: 409 });
    }

    const items = await prisma.inventoryItem.findMany({
      where: { isActive: true, quantity: { gt: 0 } },
      select: { id: true, name: true, size: true, quantity: true, costPrice: true },
    });
    const costed = items.filter((i) => i.costPrice !== null);
    const skipped = items
      .filter((i) => i.costPrice === null)
      .map((i) => (i.size ? `${i.name} (${i.size})` : i.name));

    const now = new Date();
    const batch = await prisma.stockBatch.create({
      data: {
        brand,
        label: "Opening stock",
        orderDate: now,
        receivedAt: now,
        status: "RECEIVED",
        isOpening: true,
        notes: "Stock on hand when batch tracking began, at the cost prices recorded then.",
        lots: {
          create: costed.map((i) => ({
            inventoryItemId: i.id,
            quantityReceived: i.quantity,
            quantityRemaining: i.quantity,
            unitCost: i.costPrice!,
            landedUnitCost: i.costPrice!,
          })),
        },
      },
    });

    return NextResponse.json(
      { batch, units: costed.reduce((s, i) => s + i.quantity, 0), skipped },
      { status: 201 }
    );
  } catch (error) {
    console.error("Opening stock error:", error);
    return NextResponse.json({ error: "Failed to record opening stock" }, { status: 500 });
  }
}

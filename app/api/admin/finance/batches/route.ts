import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { getBatchStats } from "@/lib/finance/batches";

const STATUSES = ["ORDERED", "IN_TRANSIT", "RECEIVED"] as const;
const brandOf = (v: unknown) => (v === "CARS" ? "CARS" : "CAPS");

// GET /api/admin/finance/batches?brand= - every batch with its stats
export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const brand = brandOf(new URL(request.url).searchParams.get("brand"));
    const [batches, unbatched] = await Promise.all([
      getBatchStats(brand),
      // Shelf units no lot accounts for (manual recounts, items added later).
      prisma.$queryRaw<{ units: bigint | null }[]>`
        select sum(greatest(i.quantity - coalesce(l.rem, 0), 0)) as units
        from inventory_items i
        left join (select "inventoryItemId", sum("quantityRemaining") rem
                   from stock_lots group by 1) l on l."inventoryItemId" = i.id
        where i."isActive"`,
    ]);
    return NextResponse.json({
      batches,
      unbatchedUnits: Number(unbatched[0]?.units ?? 0),
    });
  } catch (error) {
    console.error("Batches GET error:", error);
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}

// POST /api/admin/finance/batches - record a new stock order
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const label = String(body.label || "").trim();
    if (!label) {
      return NextResponse.json({ error: "A batch name is required" }, { status: 400 });
    }
    const batch = await prisma.stockBatch.create({
      data: {
        brand: brandOf(body.brand),
        label,
        orderDate: body.orderDate ? new Date(body.orderDate) : new Date(),
        status: STATUSES.includes(body.status) && body.status !== "RECEIVED" ? body.status : "ORDERED",
        supplier: body.supplier?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    });
    return NextResponse.json({ batch }, { status: 201 });
  } catch (error) {
    console.error("Batches POST error:", error);
    return NextResponse.json({ error: "Failed to create batch" }, { status: 500 });
  }
}

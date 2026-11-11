import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { calculateSaleProfits, needsUpdate } from "@/lib/finance/profit";

const brandOf = (v: unknown) => (v === "CARS" ? "CARS" : "CAPS");

// GET /api/admin/finance/sales/recalculate-profit?brand= - preview the sales
// whose stored profit is missing or differs from collected − cost − delivery
export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const brand = brandOf(new URL(request.url).searchParams.get("brand"));
    const rows = await calculateSaleProfits(brand);
    return NextResponse.json({ changes: rows.filter(needsUpdate) });
  } catch (error) {
    console.error("Profit recalc preview error:", error);
    return NextResponse.json(
      { error: "Failed to calculate profit" },
      { status: 500 }
    );
  }
}

// POST /api/admin/finance/sales/recalculate-profit - { brand, ids } apply.
// Values are recomputed here, never taken from the client.
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: "No sales selected" }, { status: 400 });
    }
    const rows = (await calculateSaleProfits(brandOf(body.brand), ids)).filter(
      needsUpdate
    );
    await prisma.$transaction(
      rows.map((r) =>
        prisma.sale.update({
          where: { id: r.id },
          data: { profit: r.calculated },
        })
      )
    );
    return NextResponse.json({ updated: rows.length });
  } catch (error) {
    console.error("Profit recalc apply error:", error);
    return NextResponse.json(
      { error: "Failed to update profit" },
      { status: 500 }
    );
  }
}

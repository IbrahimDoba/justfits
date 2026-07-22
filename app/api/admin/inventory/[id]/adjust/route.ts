import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";

// POST /api/admin/inventory/[id]/adjust  { delta }
// Atomically add to / deduct from stock. Clamps at 0 (never negative).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { delta } = await request.json();
    const d = parseInt(delta, 10);
    if (!Number.isFinite(d) || d === 0) {
      return NextResponse.json(
        { error: "A non-zero integer delta is required" },
        { status: 400 }
      );
    }

    // Atomic read + clamp in a transaction to avoid going negative.
    const item = await prisma.$transaction(async (tx) => {
      const current = await tx.inventoryItem.findUnique({
        where: { id },
        select: { quantity: true },
      });
      if (!current) return null;
      const next = Math.max(0, current.quantity + d);
      return tx.inventoryItem.update({
        where: { id },
        data: { quantity: next },
      });
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Inventory adjust error:", error);
    return NextResponse.json(
      { error: "Failed to adjust stock" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { recomputeLandedCosts } from "@/lib/inventory/lots";

// POST /api/admin/finance/batches/[id]/receive
// { receivedAt?, lines: [{ inventoryItemId, quantity, unitCost }] }
// Adds the units to the shelf as lots of this batch and marks it RECEIVED.
// Can be called again for a part-delivery.
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
    const body = await request.json();
    const lines = (Array.isArray(body.lines) ? body.lines : [])
      .map((raw: Record<string, unknown>) => ({
        inventoryItemId: String(raw.inventoryItemId || ""),
        quantity: parseInt(String(raw.quantity), 10) || 0,
        unitCost: Number(raw.unitCost),
      }))
      .filter((l: { inventoryItemId: string; quantity: number }) => l.inventoryItemId && l.quantity > 0);

    if (lines.length === 0) {
      return NextResponse.json({ error: "Add at least one item" }, { status: 400 });
    }
    if (lines.some((l: { unitCost: number }) => !Number.isFinite(l.unitCost) || l.unitCost < 0)) {
      return NextResponse.json({ error: "Every item needs its purchase price" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const batch = await tx.stockBatch.findUnique({ where: { id } });
      if (!batch) throw new Error("Batch not found");
      for (const l of lines) {
        await tx.stockLot.create({
          data: {
            batchId: id,
            inventoryItemId: l.inventoryItemId,
            quantityReceived: l.quantity,
            quantityRemaining: l.quantity,
            unitCost: l.unitCost,
            landedUnitCost: l.unitCost,
          },
        });
        await tx.inventoryItem.update({
          where: { id: l.inventoryItemId },
          data: { quantity: { increment: l.quantity } },
        });
      }
      await tx.stockBatch.update({
        where: { id },
        data: {
          status: "RECEIVED",
          receivedAt: batch.receivedAt ?? (body.receivedAt ? new Date(body.receivedAt) : new Date()),
        },
      });
      await recomputeLandedCosts(tx, id);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Batch receive error:", error);
    return NextResponse.json({ error: "Failed to receive stock" }, { status: 500 });
  }
}

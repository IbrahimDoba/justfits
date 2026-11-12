import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { recomputeLandedCosts } from "@/lib/inventory/lots";

type Ctx = { params: Promise<{ id: string; lotId: string }> };

// PATCH - correct a received line: { quantityReceived?, unitCost? }.
// A quantity change moves the shelf by the same amount.
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, lotId } = await params;
    const body = await request.json();
    const result = await prisma.$transaction(async (tx) => {
      const lot = await tx.stockLot.findFirst({ where: { id: lotId, batchId: id } });
      if (!lot) return "missing";
      const data: { quantityReceived?: number; quantityRemaining?: number; unitCost?: number } = {};
      if (body.quantityReceived !== undefined) {
        const q = parseInt(body.quantityReceived, 10);
        const sold = lot.quantityReceived - lot.quantityRemaining;
        if (!Number.isFinite(q) || q < sold) return "below-sold";
        const delta = q - lot.quantityReceived;
        data.quantityReceived = q;
        data.quantityRemaining = lot.quantityRemaining + delta;
        if (delta !== 0) {
          await tx.inventoryItem.update({
            where: { id: lot.inventoryItemId },
            data: { quantity: { increment: delta } },
          });
        }
      }
      if (body.unitCost !== undefined) {
        const c = Number(body.unitCost);
        if (!Number.isFinite(c) || c < 0) return "bad-cost";
        data.unitCost = c;
      }
      await tx.stockLot.update({ where: { id: lotId }, data });
      await recomputeLandedCosts(tx, id);
      return "ok";
    });
    if (result === "missing") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (result === "below-sold")
      return NextResponse.json({ error: "Quantity can't go below what has already sold" }, { status: 400 });
    if (result === "bad-cost")
      return NextResponse.json({ error: "Enter a valid purchase price" }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lot PATCH error:", error);
    return NextResponse.json({ error: "Failed to update line" }, { status: 500 });
  }
}

// DELETE - remove a received line that hasn't sold; its units leave the shelf.
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, lotId } = await params;
    const lot = await prisma.stockLot.findFirst({
      where: { id: lotId, batchId: id },
      include: { _count: { select: { allocations: true } } },
    });
    if (!lot) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (lot._count.allocations > 0) {
      return NextResponse.json({ error: "Some of these units have sold" }, { status: 409 });
    }
    await prisma.$transaction(async (tx) => {
      await tx.inventoryItem.updateMany({
        where: { id: lot.inventoryItemId },
        data: { quantity: { decrement: lot.quantityRemaining } },
      });
      await tx.stockLot.delete({ where: { id: lotId } });
      await recomputeLandedCosts(tx, id);
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lot DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove line" }, { status: 500 });
  }
}

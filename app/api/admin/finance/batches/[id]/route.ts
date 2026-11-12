import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { recomputeLandedCosts } from "@/lib/inventory/lots";
import type { Prisma } from "@prisma/client";

const STATUSES = ["ORDERED", "IN_TRANSIT", "RECEIVED"] as const;

// PATCH /api/admin/finance/batches/[id] - edit details and expense links.
// links: [{ expenseId, inBatchCost }] attaches expenses; unlink: [expenseId].
export async function PATCH(
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

    const data: Prisma.StockBatchUpdateInput = {};
    if (body.label !== undefined) data.label = String(body.label).trim();
    if (body.orderDate !== undefined) data.orderDate = new Date(body.orderDate);
    if (body.supplier !== undefined) data.supplier = body.supplier?.trim() || null;
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
    // RECEIVED is set by receiving stock, not by hand.
    if (STATUSES.includes(body.status) && body.status !== "RECEIVED") {
      data.status = body.status;
    }

    const links: { expenseId: string; inBatchCost: boolean }[] = Array.isArray(body.links)
      ? body.links.map((l: Record<string, unknown>) => ({
          expenseId: String(l.expenseId),
          inBatchCost: l.inBatchCost === true,
        }))
      : [];
    const unlink: string[] = Array.isArray(body.unlink) ? body.unlink.map(String) : [];

    const batch = await prisma.$transaction(async (tx) => {
      const updated = await tx.stockBatch.update({ where: { id }, data });
      for (const l of links) {
        await tx.expense.update({
          where: { id: l.expenseId },
          data: { batchId: id, inBatchCost: l.inBatchCost },
        });
      }
      if (unlink.length) {
        await tx.expense.updateMany({
          where: { id: { in: unlink }, batchId: id },
          data: { batchId: null, inBatchCost: false },
        });
      }
      if (links.length || unlink.length) await recomputeLandedCosts(tx, id);
      return updated;
    });

    return NextResponse.json({ batch });
  } catch (error) {
    console.error("Batch PATCH error:", error);
    return NextResponse.json({ error: "Failed to update batch" }, { status: 500 });
  }
}

// DELETE /api/admin/finance/batches/[id] - only while none of it has sold.
// Its units come off the shelf; linked expenses are kept, just unlinked.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const sold = await prisma.saleItemLot.count({ where: { lot: { batchId: id } } });
    if (sold > 0) {
      return NextResponse.json(
        { error: "Units from this batch have been sold, so it can't be deleted." },
        { status: 409 }
      );
    }
    await prisma.$transaction(async (tx) => {
      const lots = await tx.stockLot.findMany({ where: { batchId: id } });
      for (const l of lots) {
        await tx.inventoryItem.updateMany({
          where: { id: l.inventoryItemId },
          data: { quantity: { decrement: l.quantityRemaining } },
        });
      }
      await tx.stockBatch.delete({ where: { id } });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Batch DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete batch" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import type { Prisma } from "@prisma/client";
import { EXPENSE_CATEGORIES } from "@/lib/finance/constants";
import { recomputeLandedCosts } from "@/lib/inventory/lots";

// PATCH /api/admin/finance/expenses/[id]
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

    const data: Prisma.ExpenseUpdateInput = {};
    if (body.date !== undefined) data.date = new Date(body.date);
    if (body.category !== undefined && EXPENSE_CATEGORIES.includes(body.category))
      data.category = body.category;
    if (body.description !== undefined)
      data.description = body.description?.trim() || null;
    if (body.amount !== undefined) data.amount = Number(body.amount);
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

    // A batch's landed cost depends on its linked expenses.
    const expense = await prisma.$transaction(async (tx) => {
      const updated = await tx.expense.update({ where: { id }, data });
      if (updated.batchId) await recomputeLandedCosts(tx, updated.batchId);
      return updated;
    });
    return NextResponse.json({ expense });
  } catch (error) {
    console.error("Finance expenses PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/finance/expenses/[id]
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
    await prisma.$transaction(async (tx) => {
      const deleted = await tx.expense.delete({ where: { id } });
      if (deleted.batchId) await recomputeLandedCosts(tx, deleted.batchId);
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Finance expenses DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}

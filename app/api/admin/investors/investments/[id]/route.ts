import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { serializeInvestment } from "@/lib/investors/serialize";
import { deleteLinkedExpenses, syncStatus } from "@/lib/investors/server";

const STATUSES = ["ACTIVE", "MATURED", "PAID_OUT", "CANCELLED"] as const;
const numOrNull = (v: unknown) =>
  v === null || v === undefined || v === "" ? null : Number(v);

// PATCH /api/admin/investors/investments/[id]
// Edit terms, record pieces sold (unitsSold or addSold), or change status.
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

    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.investment.findUnique({ where: { id } });
      if (!current) return null;

      const data: Prisma.InvestmentUpdateInput = {};
      if (body.planName !== undefined) data.planName = String(body.planName).trim() || current.planName;
      if (body.amount !== undefined) data.amount = Number(body.amount);
      if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
      if (body.termMonths !== undefined) data.termMonths = Number(body.termMonths);
      if (body.batchLabel !== undefined) data.batchLabel = body.batchLabel?.trim() || null;
      if (body.unitsFunded !== undefined) data.unitsFunded = numOrNull(body.unitsFunded);
      if (body.unitCost !== undefined) data.unitCost = numOrNull(body.unitCost);
      if (body.perUnitReturn !== undefined) data.perUnitReturn = numOrNull(body.perUnitReturn);
      if (body.fixedRatePct !== undefined) data.fixedRatePct = numOrNull(body.fixedRatePct);
      if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
      if (body.status !== undefined && STATUSES.includes(body.status)) data.status = body.status;

      // Pieces sold: absolute (unitsSold) or increment (addSold), clamped 0..funded
      const cap = numOrNull(body.unitsFunded) ?? current.unitsFunded ?? Infinity;
      if (body.unitsSold !== undefined || body.addSold !== undefined) {
        const target =
          body.unitsSold !== undefined
            ? Number(body.unitsSold)
            : current.unitsSold + Number(body.addSold);
        data.unitsSold = Math.max(0, Math.min(cap, Math.round(target || 0)));
      }

      await tx.investment.update({ where: { id }, data });
      return syncStatus(tx, id);
    });

    if (!updated) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }
    return NextResponse.json({ investment: serializeInvestment(updated) });
  } catch (error) {
    console.error("Investment PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update investment" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/investors/investments/[id] - also removes payouts and
// their INVESTOR_RETURN expenses.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.$transaction(async (tx) => {
      const payouts = await tx.investmentPayout.findMany({
        where: { investmentId: id },
        select: { expenseId: true },
      });
      await deleteLinkedExpenses(tx, payouts.map((p) => p.expenseId));
      await tx.investment.delete({ where: { id } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Investment DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete investment" },
      { status: 500 }
    );
  }
}

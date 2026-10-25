import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { deleteLinkedExpenses, syncStatus } from "@/lib/investors/server";

// DELETE /api/admin/investors/payouts/[id] - undo a payout (and its expense)
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
    const found = await prisma.$transaction(async (tx) => {
      const payout = await tx.investmentPayout.findUnique({ where: { id } });
      if (!payout) return false;
      await tx.investmentPayout.delete({ where: { id } });
      await deleteLinkedExpenses(tx, [payout.expenseId]);
      await syncStatus(tx, payout.investmentId);
      return true;
    });
    if (!found) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Payout DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete payout" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { investorInclude, serializeInvestor } from "@/lib/investors/serialize";

// GET /api/admin/investors/[id] - one investor (used by the statement page)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const row = await prisma.investor.findUnique({
      where: { id },
      include: investorInclude,
    });
    if (!row) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 });
    }
    return NextResponse.json({ investor: serializeInvestor(row) });
  } catch (error) {
    console.error("Investor GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch investor" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/investors/[id] - edit investor details
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
    const data: Prisma.InvestorUpdateInput = {};
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }
      data.name = name;
    }
    if (body.phone !== undefined) data.phone = body.phone?.trim() || null;
    if (body.email !== undefined) data.email = body.email?.trim() || null;
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

    const investor = await prisma.investor.update({ where: { id }, data });
    return NextResponse.json({ investor });
  } catch (error) {
    console.error("Investor PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update investor" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/investors/[id] - remove an investor, their investments,
// payouts, and any INVESTOR_RETURN expenses those payouts created.
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
        where: { investment: { investorId: id }, expenseId: { not: null } },
        select: { expenseId: true },
      });
      const expenseIds = payouts
        .map((p) => p.expenseId)
        .filter((x): x is string => !!x);
      if (expenseIds.length) {
        await tx.expense.deleteMany({ where: { id: { in: expenseIds } } });
      }
      await tx.investor.delete({ where: { id } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Investor DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete investor" },
      { status: 500 }
    );
  }
}

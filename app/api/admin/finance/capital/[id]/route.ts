import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import type { Prisma } from "@prisma/client";

// PATCH /api/admin/finance/capital/[id] - update a capital entry
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

    const data: Prisma.CapitalEntryUpdateInput = {};
    if (body.date !== undefined) data.date = new Date(body.date);
    if (body.investor !== undefined)
      data.investor = String(body.investor).trim();
    if (body.kind !== undefined)
      data.kind = body.kind === "REPAYMENT" ? "REPAYMENT" : "CONTRIBUTION";
    if (body.amount !== undefined) data.amount = Number(body.amount);
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

    const entry = await prisma.capitalEntry.update({ where: { id }, data });
    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Finance capital PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update capital entry" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/finance/capital/[id] - remove a capital entry
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
    await prisma.capitalEntry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Finance capital DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete capital entry" },
      { status: 500 }
    );
  }
}

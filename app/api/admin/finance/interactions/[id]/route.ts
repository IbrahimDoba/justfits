import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import type { Prisma } from "@prisma/client";

// PATCH /api/admin/finance/interactions/[id] - update an interaction
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

    const data: Prisma.InteractionUpdateInput = {};
    if (body.date !== undefined) data.date = new Date(body.date);
    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.contact !== undefined)
      data.contact = body.contact?.trim() || null;
    if (body.amount !== undefined)
      data.amount =
        body.amount === null || body.amount === "" ? null : Number(body.amount);
    if (body.note !== undefined) data.note = body.note?.trim() || null;

    const interaction = await prisma.interaction.update({ where: { id }, data });
    return NextResponse.json({ interaction });
  } catch (error) {
    console.error("Finance interactions PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update interaction" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/finance/interactions/[id] - remove an interaction
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
    await prisma.interaction.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Finance interactions DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete interaction" },
      { status: 500 }
    );
  }
}

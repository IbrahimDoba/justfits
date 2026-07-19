import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import type { Prisma } from "@prisma/client";

// PATCH /api/admin/notes/[id]
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

    const data: Prisma.AdminNoteUpdateInput = {};
    if (body.title !== undefined) data.title = body.title?.trim() || null;
    if (body.content !== undefined) {
      const content = String(body.content).trim();
      if (!content) {
        return NextResponse.json(
          { error: "Note content cannot be empty" },
          { status: 400 }
        );
      }
      data.content = content;
    }
    if (body.pinned !== undefined) data.pinned = Boolean(body.pinned);

    const note = await prisma.adminNote.update({ where: { id }, data });
    return NextResponse.json({ note });
  } catch (error) {
    console.error("Notes PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/notes/[id]
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
    await prisma.adminNote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notes DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import type { Prisma } from "@prisma/client";

// GET /api/admin/notes - list notes (pinned first, newest first)
export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    const where: Prisma.AdminNoteWhereInput = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const notes = await prisma.adminNote.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Notes GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST /api/admin/notes - create a note
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const content = String(body.content || "").trim();

    if (!content) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    const note = await prisma.adminNote.create({
      data: {
        title: body.title?.trim() || null,
        content,
        pinned: Boolean(body.pinned),
        authorName: session.user?.name || null,
        authorEmail: session.user?.email || null,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Notes POST error:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

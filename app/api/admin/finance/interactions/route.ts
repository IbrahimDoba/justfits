import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";

// GET /api/admin/finance/interactions?brand=CARS - list logged interactions
export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const brand =
      request.nextUrl.searchParams.get("brand") === "CAPS" ? "CAPS" : "CARS";
    const interactions = await prisma.interaction.findMany({
      where: { brand },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      interactions: interactions.map((i) => ({
        ...i,
        amount: i.amount === null ? null : Number(i.amount),
      })),
    });
  } catch (error) {
    console.error("Finance interactions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interactions" },
      { status: 500 }
    );
  }
}

// POST /api/admin/finance/interactions - log an interaction
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const interaction = await prisma.interaction.create({
      data: {
        brand: body.brand === "CAPS" ? "CAPS" : "CARS",
        date: body.date ? new Date(body.date) : new Date(),
        title,
        contact: body.contact?.trim() || null,
        amount:
          body.amount === null || body.amount === undefined || body.amount === ""
            ? null
            : Number(body.amount),
        note: body.note?.trim() || null,
      },
    });

    return NextResponse.json({ interaction }, { status: 201 });
  } catch (error) {
    console.error("Finance interactions POST error:", error);
    return NextResponse.json(
      { error: "Failed to create interaction" },
      { status: 500 }
    );
  }
}

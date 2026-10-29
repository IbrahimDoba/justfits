import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";

// GET /api/admin/finance/capital?brand=CAPS - list investor capital entries
export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const brand =
      request.nextUrl.searchParams.get("brand") === "CARS" ? "CARS" : "CAPS";
    const entries = await prisma.capitalEntry.findMany({
      where: { brand },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      entries: entries.map((e) => ({ ...e, amount: Number(e.amount) })),
    });
  } catch (error) {
    console.error("Finance capital GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch capital entries" },
      { status: 500 }
    );
  }
}

// POST /api/admin/finance/capital - record a contribution or repayment
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const investor = String(body.investor || "").trim();
    const amount = Number(body.amount);
    if (!investor) {
      return NextResponse.json(
        { error: "Investor name is required" },
        { status: 400 }
      );
    }
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "A positive amount is required" },
        { status: 400 }
      );
    }

    const entry = await prisma.capitalEntry.create({
      data: {
        brand: body.brand === "CARS" ? "CARS" : "CAPS",
        date: body.date ? new Date(body.date) : new Date(),
        investor,
        kind: body.kind === "REPAYMENT" ? "REPAYMENT" : "CONTRIBUTION",
        amount,
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Finance capital POST error:", error);
    return NextResponse.json(
      { error: "Failed to create capital entry" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { investorInclude, serializeInvestor } from "@/lib/investors/serialize";

// GET /api/admin/investors - investors with investments, payouts and totals
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await prisma.investor.findMany({
      orderBy: { createdAt: "desc" },
      include: investorInclude,
    });
    const now = new Date();
    const investors = rows.map((r) => serializeInvestor(r, now));

    const all = investors.flatMap((i) => i.investments);
    const live = all.filter((i) => i.status !== "CANCELLED");
    const upcoming = live
      .filter((i) => i.status === "ACTIVE" && i.metrics.outstanding > 0)
      .map((i) => i.metrics.maturityDate)
      .sort();

    return NextResponse.json({
      investors,
      summary: {
        investorsCount: investors.length,
        totalInvested: live.reduce((a, i) => a + i.amount, 0),
        activeCapital: investors.reduce((a, i) => a + i.totals.activeCapital, 0),
        dueNow: live.reduce((a, i) => a + i.metrics.dueNow, 0),
        outstanding: live.reduce((a, i) => a + i.metrics.outstanding, 0),
        totalPaid: all.reduce((a, i) => a + i.metrics.totalPaid, 0),
        returnsPaid: all.reduce((a, i) => a + i.metrics.returnPaid, 0),
        nextMaturity: upcoming[0] ?? null,
      },
    });
  } catch (error) {
    console.error("Investors GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch investors" },
      { status: 500 }
    );
  }
}

// POST /api/admin/investors - add an investor
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const investor = await prisma.investor.create({
      data: {
        name,
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json({ investor }, { status: 201 });
  } catch (error) {
    console.error("Investors POST error:", error);
    return NextResponse.json(
      { error: "Failed to create investor" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { serializeInvestment } from "@/lib/investors/serialize";

const numOrNull = (v: unknown) =>
  v === null || v === undefined || v === "" ? null : Number(v);

// POST /api/admin/investors/investments - record a new investment
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const investorId = String(body.investorId || "");
    const planType = body.planType === "FIXED_RETURN" ? "FIXED_RETURN" : "PER_UNIT";
    const amount = Number(body.amount);
    const termMonths = Number(body.termMonths);

    if (!investorId) {
      return NextResponse.json({ error: "Investor is required" }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be above 0" }, { status: 400 });
    }
    if (!Number.isInteger(termMonths) || termMonths <= 0) {
      return NextResponse.json({ error: "Term must be at least 1 month" }, { status: 400 });
    }

    let unitCost = null as number | null;
    let perUnitReturn = null as number | null;
    let unitsFunded = null as number | null;
    let fixedRatePct = null as number | null;

    if (planType === "PER_UNIT") {
      unitCost = numOrNull(body.unitCost);
      perUnitReturn = numOrNull(body.perUnitReturn);
      if (!unitCost || unitCost <= 0 || perUnitReturn === null || perUnitReturn < 0) {
        return NextResponse.json(
          { error: "Cost per piece and return per piece are required" },
          { status: 400 }
        );
      }
      unitsFunded = numOrNull(body.unitsFunded) ?? Math.floor(amount / unitCost);
    } else {
      fixedRatePct = numOrNull(body.fixedRatePct);
      if (fixedRatePct === null || fixedRatePct < 0) {
        return NextResponse.json({ error: "Return % is required" }, { status: 400 });
      }
    }

    const investment = await prisma.investment.create({
      data: {
        investorId,
        planType,
        planName:
          String(body.planName || "").trim() ||
          (planType === "PER_UNIT" ? "Per-Piece Partner" : "Stock Note"),
        amount,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        termMonths,
        batchLabel: body.batchLabel?.trim() || null,
        unitsFunded,
        unitCost,
        perUnitReturn,
        fixedRatePct,
        notes: body.notes?.trim() || null,
      },
      include: { payouts: true },
    });

    return NextResponse.json(
      { investment: serializeInvestment(investment) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Investment POST error:", error);
    return NextResponse.json(
      { error: "Failed to create investment" },
      { status: 500 }
    );
  }
}

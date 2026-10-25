import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { serializeInvestment } from "@/lib/investors/serialize";
import { loadInvestment, syncStatus } from "@/lib/investors/server";

// POST /api/admin/investors/investments/[id]/payouts
// Body either:
//   { settle: true, date? }               -> pay everything due now, split into
//                                            PRINCIPAL + RETURN automatically
//   { type, amount, date?, notes? }       -> a single manual payout
// RETURN payouts are mirrored as INVESTOR_RETURN expenses in Finance (cost of
// capital). PRINCIPAL repayments are not expenses.
export async function POST(
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
    const date = body.date ? new Date(body.date) : new Date();
    const notes = body.notes?.trim() || null;

    const result = await prisma.$transaction(async (tx) => {
      const inv = await tx.investment.findUnique({
        where: { id },
        include: { payouts: true, investor: { select: { name: true } } },
      });
      if (!inv) return { error: "Investment not found", status: 404 } as const;

      let lines: { type: "PRINCIPAL" | "RETURN"; amount: number }[];
      if (body.settle) {
        const { metrics } = serializeInvestment(inv);
        lines = [
          { type: "PRINCIPAL" as const, amount: metrics.principalDue },
          { type: "RETURN" as const, amount: metrics.returnDue },
        ].filter((l) => l.amount > 0);
        if (!lines.length) {
          return { error: "Nothing is due right now", status: 400 } as const;
        }
      } else {
        const type = body.type === "RETURN" ? "RETURN" : "PRINCIPAL";
        const amount = Number(body.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
          return { error: "Amount must be above 0", status: 400 } as const;
        }
        lines = [{ type, amount }];
      }

      for (const line of lines) {
        let expenseId: string | null = null;
        if (line.type === "RETURN") {
          const expense = await tx.expense.create({
            data: {
              brand: "CAPS",
              date,
              category: "INVESTOR_RETURN",
              description: `Investor return: ${inv.investor.name} (${inv.planName})`,
              amount: line.amount,
              notes: `Auto-created from investor payout${notes ? ` · ${notes}` : ""}`,
            },
          });
          expenseId = expense.id;
        }
        await tx.investmentPayout.create({
          data: { investmentId: id, date, amount: line.amount, type: line.type, expenseId, notes },
        });
      }

      const synced = (await syncStatus(tx, id)) ?? (await loadInvestment(tx, id));
      return { investment: synced! };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(
      { investment: serializeInvestment(result.investment) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Investment payout POST error:", error);
    return NextResponse.json(
      { error: "Failed to record payout" },
      { status: 500 }
    );
  }
}

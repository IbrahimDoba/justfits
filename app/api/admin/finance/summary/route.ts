import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";

// GET /api/admin/finance/summary - aggregated P&L for the offline ledger
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [salesAgg, expenseAgg, expensesByCategory, sales, expenses] =
      await Promise.all([
        prisma.sale.aggregate({
          _sum: {
            totalCollected: true,
            profit: true,
            quantity: true,
            deliveryFee: true,
          },
          _count: true,
        }),
        prisma.expense.aggregate({ _sum: { amount: true }, _count: true }),
        prisma.expense.groupBy({
          by: ["category"],
          _sum: { amount: true },
        }),
        prisma.sale.findMany({
          select: { date: true, totalCollected: true, deliveryFee: true },
        }),
        prisma.expense.findMany({ select: { date: true, amount: true } }),
      ]);

    const totalRevenue = Number(salesAgg._sum.totalCollected || 0);
    const totalProfit = Number(salesAgg._sum.profit || 0);
    // Delivery fees on sales are money paid out to couriers — count them as
    // expenses alongside the recorded expense entries.
    const salesDeliveryFees = Number(salesAgg._sum.deliveryFee || 0);
    const totalExpenses = Number(expenseAgg._sum.amount || 0) + salesDeliveryFees;
    const unitsSold = salesAgg._sum.quantity || 0;

    // Monthly series: revenue vs expenses, keyed "MMM YYYY"
    const monthKey = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", year: "numeric" });

    const months: Record<string, { revenue: number; expenses: number }> = {};
    for (const s of sales) {
      const k = monthKey(s.date);
      const m = (months[k] ??= { revenue: 0, expenses: 0 });
      m.revenue += Number(s.totalCollected);
      m.expenses += Number(s.deliveryFee || 0);
    }
    for (const e of expenses) {
      const k = monthKey(e.date);
      (months[k] ??= { revenue: 0, expenses: 0 }).expenses += Number(e.amount);
    }

    const monthly = Object.entries(months)
      .sort(
        ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
      )
      .map(([name, v]) => ({
        name,
        revenue: v.revenue,
        expenses: v.expenses,
        net: v.revenue - v.expenses,
      }));

    return NextResponse.json({
      totals: {
        totalRevenue,
        totalProfit,
        totalExpenses,
        salesDeliveryFees,
        net: totalRevenue - totalExpenses,
        netByProfit: totalProfit - totalExpenses,
        unitsSold,
        salesCount: salesAgg._count,
        expensesCount: expenseAgg._count,
      },
      expensesByCategory: expensesByCategory
        .map((c) => ({
          category: c.category as string,
          amount: Number(c._sum.amount || 0),
        }))
        .concat(
          salesDeliveryFees > 0
            ? [{ category: "SALES DELIVERY", amount: salesDeliveryFees }]
            : []
        )
        .sort((a, b) => b.amount - a.amount),
      monthly,
    });
  } catch (error) {
    console.error("Finance summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}

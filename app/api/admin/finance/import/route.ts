import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { financeSeedSales, financeSeedExpenses } from "@/lib/finance/seed-data";

// POST /api/admin/finance/import
// One-click import of the real historical spreadsheet data. Idempotent:
// if any sales or expenses already exist, it does nothing.
export async function POST() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [existingSales, existingExpenses] = await Promise.all([
      prisma.sale.count(),
      prisma.expense.count(),
    ]);

    if (existingSales > 0 || existingExpenses > 0) {
      return NextResponse.json({
        imported: false,
        message: `Ledger already has data (${existingSales} sales, ${existingExpenses} expenses). Nothing imported.`,
        salesCount: existingSales,
        expensesCount: existingExpenses,
      });
    }

    await prisma.sale.createMany({
      data: financeSeedSales.map((s) => ({
        date: new Date(s.date),
        customerName: s.customerName,
        productText: s.productText,
        variantText: s.variantText,
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        deliveryFee: s.deliveryFee,
        deliveryPaidBy: s.deliveryPaidBy,
        totalCollected: s.totalCollected,
        profit: s.profit,
        paymentStatus: s.paymentStatus,
        notes: s.notes ?? null,
        deductedStock: false,
      })),
    });

    await prisma.expense.createMany({
      data: financeSeedExpenses.map((e) => ({
        date: new Date(e.date),
        category: e.category,
        description: e.description,
        amount: e.amount,
      })),
    });

    return NextResponse.json({
      imported: true,
      message: "Historical data imported successfully.",
      salesCount: financeSeedSales.length,
      expensesCount: financeSeedExpenses.length,
    });
  } catch (error) {
    console.error("Finance import error:", error);
    return NextResponse.json(
      { error: "Failed to import historical data" },
      { status: 500 }
    );
  }
}

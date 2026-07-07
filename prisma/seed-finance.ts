import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { financeSeedSales, financeSeedExpenses } from "../lib/finance/seed-data";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingSales = await prisma.sale.count();
  const existingExpenses = await prisma.expense.count();

  if (existingSales > 0 || existingExpenses > 0) {
    console.log(
      `Finance data already present (sales: ${existingSales}, expenses: ${existingExpenses}). Skipping import to avoid duplicates.`
    );
    return;
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

  const salesAgg = await prisma.sale.aggregate({
    _sum: { totalCollected: true, profit: true, quantity: true },
  });
  const expAgg = await prisma.expense.aggregate({ _sum: { amount: true } });

  console.log(
    `Imported ${financeSeedSales.length} sales and ${financeSeedExpenses.length} expenses.`
  );
  console.log(
    `Totals — collected: ₦${Number(salesAgg._sum.totalCollected)}, profit: ₦${Number(
      salesAgg._sum.profit
    )}, units: ${salesAgg._sum.quantity}, expenses: ₦${Number(expAgg._sum.amount)}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

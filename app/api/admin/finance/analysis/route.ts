import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const N = (x: unknown) => Number(x ?? 0);
const monthKey = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

// Shared aggregation for the Analysis tab: every number the widgets can't show.
async function buildMetrics() {
  const [sales, expenses, inventory] = await Promise.all([
    prisma.sale.findMany({ orderBy: { date: "asc" } }),
    prisma.expense.findMany({ orderBy: { date: "asc" } }),
    prisma.inventoryItem.findMany({ where: { isActive: true } }),
  ]);

  const months: Record<
    string,
    { revenue: number; expenses: number; stock: number; ads: number; units: number; net: number }
  > = {};
  let revenue = 0;
  let grossProfit = 0;
  let units = 0;
  let salesDelivery = 0;

  for (const s of sales) {
    const m = (months[monthKey(s.date)] ??= {
      revenue: 0, expenses: 0, stock: 0, ads: 0, units: 0, net: 0,
    });
    m.revenue += N(s.totalCollected);
    m.expenses += N(s.deliveryFee);
    m.units += s.quantity;
    revenue += N(s.totalCollected);
    grossProfit += N(s.profit);
    units += s.quantity;
    salesDelivery += N(s.deliveryFee);
  }

  let expenseTotal = 0;
  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    const m = (months[monthKey(e.date)] ??= {
      revenue: 0, expenses: 0, stock: 0, ads: 0, units: 0, net: 0,
    });
    const a = N(e.amount);
    m.expenses += a;
    if (e.category === "STOCK") m.stock += a;
    if (e.category === "ADS") m.ads += a;
    expenseTotal += a;
    byCategory[e.category] = (byCategory[e.category] || 0) + a;
  }

  const monthly = Object.keys(months)
    .sort()
    .map((k) => {
      const m = months[k];
      m.net = m.revenue - m.expenses;
      return {
        month: k,
        revenue: m.revenue,
        expenses: m.expenses,
        stockSpend: m.stock,
        adSpend: m.ads,
        units: m.units,
        net: m.net,
        adRoi: m.ads > 0 ? Number((m.revenue / m.ads).toFixed(1)) : null,
      };
    });

  const invUnits = inventory.reduce((a, i) => a + i.quantity, 0);
  const invCost = inventory.reduce((a, i) => a + i.quantity * N(i.costPrice), 0);
  const invRetail = inventory.reduce(
    (a, i) => a + i.quantity * N(i.sellingPrice),
    0
  );

  const unpaid = sales.filter((s) => s.paymentStatus !== "PAID");
  const receivables = unpaid.reduce((a, s) => {
    const expected = N(s.unitPrice) * s.quantity + N(s.deliveryFee);
    return a + Math.max(0, expected - N(s.totalCollected));
  }, 0);

  const cashNet = revenue - expenseTotal - salesDelivery;

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      revenue,
      grossProfit,
      expenseTotal,
      salesDelivery,
      cashNet,
      units,
      salesCount: sales.length,
      avgCollectedPerUnit: units ? Math.round(revenue / units) : 0,
      grossMarginPct: revenue ? Number(((grossProfit / revenue) * 100).toFixed(1)) : 0,
    },
    inventory: { units: invUnits, costValue: invCost, retailValue: invRetail },
    receivables: { count: unpaid.length, amount: receivables },
    expensesByCategory: byCategory,
    monthly,
  };
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ metrics: await buildMetrics() });
  } catch (error) {
    console.error("Finance analysis GET error:", error);
    return NextResponse.json({ error: "Failed to build metrics" }, { status: 500 });
  }
}

// POST = generate the AI review over the computed metrics
export async function POST() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const metrics = await buildMetrics();

    const prompt = `You are a sharp, practical finance analyst advising JUSTFITS — a Nigerian car-themed caps & apparel brand (currency NGN, sells via Instagram/WhatsApp, restocks by importing batches).

Analyse the metrics JSON below. Important context on the numbers:
- "grossProfit" per sale = collected − landed item cost − delivery paid out (already restated; before ads/packaging/fees).
- "cashNet" = all money in minus all money out. Stock purchases hit expenses when bought, so cash dips in restock months while value sits in inventory.
- "inventory.costValue" is money currently tied up on the shelf; "receivables" is money customers still owe.
- Business model reality: ads drive sales (watch adRoi), delivery costs ~13% of revenue, restocks are lumpy.

Write a concise review in markdown with EXACTLY these sections:
## Verdict — 2-3 sentences on overall health, leading with the single most important fact.
## What's working — 2-4 bullets, each citing a number.
## Watch out — 2-4 bullets on risks/leaks, each citing a number.
## Do next — 3-5 concrete, ordered actions for the coming month, specific to these numbers (amounts in ₦).

Keep it under 300 words. Be direct, no fluff, no generic advice — every claim must reference the data.

${JSON.stringify(metrics)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const review = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ metrics, review });
  } catch (error) {
    console.error("Finance analysis POST error:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}

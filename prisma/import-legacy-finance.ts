// One-off import of the ORIGINAL stock records from Justfits_Management_Template.xlsx
// (Sales + Expenses sheets, Oct 2025 – Jan 2026). This pre-dates the Batch 2 data
// already imported via lib/finance/seed-data.ts (which starts 2026-02-24).
//
// Most sales rows in the source sheet had no date. Dates are reconstructed from
// three anchors cross-referenced against the Expenses sheet:
//   - first two sales dated 25/26 Nov 2025 in the sheet itself
//   - "gift to sarkin mota" expense on 27-11-25 matches the sarkin mota gift sale
//   - "giveaway delivery" expense on 04-01-26 matches the two giveaway sales
// Rows between anchors are interpolated evenly; every estimated date is flagged
// in the sale's notes so it can be corrected in the admin UI later.
//
// Run:  npx tsx prisma/import-legacy-finance.ts --dry-run   (preview)
//       npx tsx prisma/import-legacy-finance.ts             (import)

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DRY_RUN = process.argv.includes("--dry-run");

// Everything in this import is strictly before the Batch 2 data.
const CUTOFF = new Date("2026-02-01T00:00:00Z");

type LegacySale = {
  date?: string; // ISO; present only for anchored rows
  anchored?: string; // why the date is trusted
  customerName: string;
  productText: string;
  variantText: string | null;
  quantity: number;
  unitPrice: number;
  deliveryFee: number | null;
  deliveryPaidBy: string | null;
  totalCollected: number;
  profit: number | null;
  paymentStatus: "PAID" | "PARTIAL" | "PENDING";
  notes?: string;
};

// Rows in original sheet order (order is assumed chronological).
const legacySales: LegacySale[] = [
  { date: "2025-11-25", anchored: "dated in sheet", customerName: "Ben", productText: "Benz caps", variantText: "Green, Blue, Black", quantity: 3, unitPrice: 19000, deliveryFee: 3000, deliveryPaidBy: "Me", totalCollected: 57000, profit: 54000, paymentStatus: "PAID" },
  { date: "2025-11-26", anchored: "dated in sheet", customerName: "Isiaka", productText: "Benz cap", variantText: "Blue", quantity: 1, unitPrice: 18000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 18000, profit: 18000, paymentStatus: "PAID", notes: "Was pending in source sheet — confirmed paid" },
  { customerName: "Abuja car", productText: "Benz cap", variantText: "Blue, White, Black (2)", quantity: 4, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 100000, profit: 100000, paymentStatus: "PAID" },
  { customerName: "Imran", productText: "Benz cap", variantText: "Cream", quantity: 1, unitPrice: 25000, deliveryFee: 3000, deliveryPaidBy: null, totalCollected: 28000, profit: 28000, paymentStatus: "PAID" },
  { customerName: "Baraya", productText: "BMW", variantText: "Black", quantity: 1, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 25000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Muhammed", productText: "BMW", variantText: "Black", quantity: 1, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 25000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Ernest", productText: "Benz", variantText: "Blue", quantity: 1, unitPrice: 25000, deliveryFee: 8000, deliveryPaidBy: "Him", totalCollected: 33000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Usman Ibrahim", productText: "Benz", variantText: "Blue", quantity: 1, unitPrice: 23000, deliveryFee: 1000, deliveryPaidBy: "Him", totalCollected: 24000, profit: 23000, paymentStatus: "PAID" },
  { customerName: "Binta", productText: "Benz", variantText: "White", quantity: 1, unitPrice: 15000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 15000, profit: 15000, paymentStatus: "PAID" },
  { customerName: "CarsConnect", productText: "Benz/BMW", variantText: "Black, Blue", quantity: 3, unitPrice: 23333.33, deliveryFee: null, deliveryPaidBy: null, totalCollected: 70000, profit: 70000, paymentStatus: "PAID", notes: "Mixed unit prices 25,000 / 22,500 — unit price shown is average" },
  { customerName: "Jude", productText: "BMW", variantText: "Black", quantity: 1, unitPrice: 25000, deliveryFee: 4000, deliveryPaidBy: "Him", totalCollected: 29000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Usman Ibrahim", productText: "Benz", variantText: "Black", quantity: 1, unitPrice: 23000, deliveryFee: 1000, deliveryPaidBy: "Him", totalCollected: 24000, profit: 24000, paymentStatus: "PAID" },
  { customerName: "Mohammed Sheh", productText: "BMW/Ferrari", variantText: "Black/Black", quantity: 2, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 50000, profit: 50000, paymentStatus: "PAID" },
  { customerName: "Yusuf", productText: "BMW", variantText: "Black", quantity: 1, unitPrice: 15000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 15000, profit: 15000, paymentStatus: "PAID" },
  { date: "2025-11-27", anchored: "matches 'gift to sarkin mota' expense dated 27-11-25", customerName: "Sarkin Mota", productText: "BMW / 2 Benz", variantText: "Black, Cream, White", quantity: 3, unitPrice: 0, deliveryFee: null, deliveryPaidBy: null, totalCollected: 0, profit: 0, paymentStatus: "PAID", notes: "Gift — 3 caps given to car stand" },
  { customerName: "Moh", productText: "Benz", variantText: "White", quantity: 1, unitPrice: 25000, deliveryFee: 2000, deliveryPaidBy: "Him", totalCollected: 27000, profit: 27000, paymentStatus: "PAID" },
  { customerName: "Yingi", productText: "Ferrari", variantText: "Black & Red", quantity: 1, unitPrice: 20000, deliveryFee: 8000, deliveryPaidBy: "Her", totalCollected: 28000, profit: 20000, paymentStatus: "PAID" },
  { customerName: "Shuaib", productText: "BMW/Benz", variantText: "Black/White", quantity: 2, unitPrice: 24000, deliveryFee: 2000, deliveryPaidBy: "Him", totalCollected: 50000, profit: 48000, paymentStatus: "PAID", notes: "Sheet price 48,000 was for the pair" },
  { customerName: "Pepe", productText: "Benz", variantText: "Cream", quantity: 1, unitPrice: 25000, deliveryFee: 2500, deliveryPaidBy: "Him", totalCollected: 27500, profit: 25000, paymentStatus: "PAID" },
  { customerName: "AeDeeAe", productText: "Benz/Ferrari", variantText: "Black/White", quantity: 2, unitPrice: 21250, deliveryFee: 8000, deliveryPaidBy: "Him", totalCollected: 50500, profit: 42500, paymentStatus: "PAID", notes: "Mixed unit prices 25,000 / 17,500 — unit price shown is average" },
  { customerName: "Lawson", productText: "Benz", variantText: "White", quantity: 1, unitPrice: 25000, deliveryFee: 8000, deliveryPaidBy: "Him", totalCollected: 33000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Yusuf/SM", productText: "BMW", variantText: "Black", quantity: 1, unitPrice: 28000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 28000, profit: 28000, paymentStatus: "PAID" },
  { customerName: "Rico", productText: "Benz", variantText: "Blue", quantity: 1, unitPrice: 25000, deliveryFee: 6000, deliveryPaidBy: "Him", totalCollected: 31000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Ishaya", productText: "BMW/Ferrari", variantText: "Black / Red & Black", quantity: 2, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 50000, profit: 50000, paymentStatus: "PAID" },
  { customerName: "General", productText: "Benz", variantText: "White", quantity: 1, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: "Him", totalCollected: 25000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Apieceofjahm", productText: "Benz", variantText: "Black", quantity: 1, unitPrice: 25000, deliveryFee: 2000, deliveryPaidBy: "Her", totalCollected: 27000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Pepe", productText: "Benz", variantText: "Blue", quantity: 1, unitPrice: 17500, deliveryFee: null, deliveryPaidBy: "Him", totalCollected: 17500, profit: 17500, paymentStatus: "PAID" },
  { customerName: "Yusman", productText: "Benz", variantText: "Blue/White", quantity: 2, unitPrice: 25000, deliveryFee: 2500, deliveryPaidBy: "Me", totalCollected: 50000, profit: 48500, paymentStatus: "PAID", notes: "Sheet price 50,000 was for the pair" },
  { customerName: "Hafsat", productText: "BMW", variantText: "Black", quantity: 1, unitPrice: 35000, deliveryFee: null, deliveryPaidBy: "Pickup", totalCollected: 35000, profit: 35000, paymentStatus: "PAID" },
  { customerName: "Christopher", productText: "Benz", variantText: "Blue", quantity: 1, unitPrice: 25000, deliveryFee: 3000, deliveryPaidBy: "Him", totalCollected: 28000, profit: 28000, paymentStatus: "PAID" },
  { customerName: "Price David", productText: "3 Benz / 1 BMW", variantText: "Black, Cream, Blue", quantity: 4, unitPrice: 20000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 80000, profit: 80000, paymentStatus: "PAID" },
  { customerName: "Musa", productText: "BMW", variantText: "Black", quantity: 1, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 25000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Abdulmumin", productText: "BMW/Ferrari", variantText: "Black / Red & Black", quantity: 2, unitPrice: 25000, deliveryFee: 4000, deliveryPaidBy: "Him", totalCollected: 54000, profit: 50000, paymentStatus: "PAID", notes: "Sheet price 50,000 was for the pair" },
  { customerName: "Abdulaziz", productText: "Benz", variantText: "White", quantity: 1, unitPrice: 25000, deliveryFee: 3000, deliveryPaidBy: "Him", totalCollected: 28000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Aminu", productText: "BMW", variantText: "Black", quantity: 1, unitPrice: 26000, deliveryFee: 4000, deliveryPaidBy: "Him", totalCollected: 30000, profit: 26000, paymentStatus: "PAID" },
  { customerName: "Obi Caleb", productText: "Benz", variantText: "White", quantity: 1, unitPrice: 25000, deliveryFee: 2000, deliveryPaidBy: "Him", totalCollected: 27000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Muhammed Z", productText: "Ferrari", variantText: "Red/Black", quantity: 1, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 25000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Tosin", productText: "Benz", variantText: "White", quantity: 1, unitPrice: 25000, deliveryFee: 8500, deliveryPaidBy: "Both", totalCollected: 28650, profit: 20150, paymentStatus: "PAID" },
  { customerName: "Chiima", productText: "Benz", variantText: "Black", quantity: 1, unitPrice: 25000, deliveryFee: 3700, deliveryPaidBy: "Him", totalCollected: 28700, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Clinton", productText: "Benz", variantText: "Black", quantity: 1, unitPrice: 25000, deliveryFee: 2000, deliveryPaidBy: "Him", totalCollected: 27000, profit: 24500, paymentStatus: "PAID" },
  { customerName: "Sultan", productText: "Ferrari", variantText: "Black/Red", quantity: 1, unitPrice: 25000, deliveryFee: 2000, deliveryPaidBy: "Him", totalCollected: 27000, profit: 27000, paymentStatus: "PAID" },
  { customerName: "Zaharudeen", productText: "Benz", variantText: "Black/Brown", quantity: 2, unitPrice: 25000, deliveryFee: 5000, deliveryPaidBy: "Him", totalCollected: 55000, profit: 50000, paymentStatus: "PAID", notes: "Sheet price 50,000 was for the pair" },
  { date: "2026-01-04", anchored: "matches 'giveaway delivery' expense dated 04-01-26", customerName: "Abdulraheem", productText: "Ferrari", variantText: "Red/Black", quantity: 1, unitPrice: 0, deliveryFee: null, deliveryPaidBy: null, totalCollected: 0, profit: 0, paymentStatus: "PAID", notes: "Giveaway" },
  { date: "2026-01-04", anchored: "matches 'giveaway delivery' expense dated 04-01-26", customerName: "Abubakar Sadiq", productText: "Benz", variantText: "Green", quantity: 1, unitPrice: 0, deliveryFee: 5000, deliveryPaidBy: "Me", totalCollected: 0, profit: 0, paymentStatus: "PAID", notes: "Giveaway — delivery to Nyanya paid by us (recorded as expense)" },
  { customerName: "Femi", productText: "Benz", variantText: "White", quantity: 1, unitPrice: 25000, deliveryFee: 7000, deliveryPaidBy: "Him", totalCollected: 32000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Jaykalifa", productText: "Ferrari", variantText: "Red/Black", quantity: 1, unitPrice: 25000, deliveryFee: 3000, deliveryPaidBy: "Her", totalCollected: 28000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Sarki Mota", productText: "BMW, Benz", variantText: "Black/Cream", quantity: 2, unitPrice: 27500, deliveryFee: null, deliveryPaidBy: "Pickup", totalCollected: 55000, profit: 55000, paymentStatus: "PAID", notes: "Mixed unit prices 30,000 / 25,000 — unit price shown is average" },
  { customerName: "Musa (friend)", productText: "BMW", variantText: "Black", quantity: 1, unitPrice: 30000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 30000, profit: 30000, paymentStatus: "PAID" },
  { customerName: "Goke Alade", productText: "Ferrari", variantText: "Red/Black", quantity: 1, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: "Pickup", totalCollected: 25000, profit: 25000, paymentStatus: "PAID" },
  { customerName: "Onileow", productText: "Benz", variantText: "White", quantity: 1, unitPrice: 25000, deliveryFee: 3600, deliveryPaidBy: "Him", totalCollected: 25000, profit: 25000, paymentStatus: "PAID" },
  // From the PENDING sheet — paid but not delivered at the time the sheet was last updated
  { customerName: "Zaharudeen1 (IG)", productText: "Benz cap", variantText: "Black", quantity: 1, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 25000, profit: null, paymentStatus: "PAID", notes: "From PENDING sheet: paid, not yet delivered" },
];

type LegacyExpense = {
  date: string;
  category: "STOCK" | "PACKAGING" | "ADS" | "DELIVERY" | "LOSS" | "RENT" | "SALARIES" | "FEES" | "OTHER";
  description: string;
  amount: number;
};

// Note: the "gift to sarkin mota" expense row (amount 0) is intentionally
// omitted — the same event is recorded above as the Sarkin Mota gift sale.
const legacyExpenses: LegacyExpense[] = [
  { date: "2025-10-28", category: "STOCK", description: "100 pieces of face caps, including delivery", amount: 761743 },
  { date: "2025-11-17", category: "STOCK", description: "Customs clearance", amount: 283000 },
  { date: "2025-11-22", category: "ADS", description: "TikTok ads (1 day)", amount: 2805 },
  { date: "2025-11-23", category: "ADS", description: "TikTok ads (1 day)", amount: 2805 },
  { date: "2025-11-24", category: "ADS", description: "TikTok ads (1 day)", amount: 4410 },
  { date: "2025-11-24", category: "ADS", description: "Instagram ads (1 day)", amount: 3135 },
  { date: "2025-11-25", category: "ADS", description: "Instagram ads (2 days)", amount: 10835 },
  { date: "2025-11-27", category: "OTHER", description: "Fuel (white Camry)", amount: 5000 },
  { date: "2025-11-29", category: "ADS", description: "Instagram ads x2 (2 days caps, 2 days video)", amount: 22164 },
  { date: "2025-11-29", category: "ADS", description: "TikTok ads (1 day)", amount: 3500 },
  { date: "2025-11-30", category: "FEES", description: "CAC business name registration", amount: 30000 },
  { date: "2025-12-01", category: "ADS", description: "500 flyers", amount: 50000 },
  { date: "2025-12-01", category: "ADS", description: "Instagram ads (2 days)", amount: 7500 },
  { date: "2025-12-02", category: "ADS", description: "Instagram verified subscription (1 month)", amount: 4500 },
  { date: "2025-12-03", category: "ADS", description: "Instagram ads (2 days)", amount: 10750 },
  { date: "2025-12-04", category: "ADS", description: "Instagram ads (2 days)", amount: 10800 },
  { date: "2025-12-07", category: "ADS", description: "Instagram ads (2 days)", amount: 10910 },
  { date: "2025-12-10", category: "ADS", description: "Instagram ads (3 days)", amount: 16400 },
  { date: "2025-12-15", category: "ADS", description: "Instagram ads (1 day)", amount: 10000 },
  { date: "2025-12-17", category: "ADS", description: "Instagram ads (2 days)", amount: 15660 },
  { date: "2025-12-18", category: "ADS", description: "TikTok ads (2 days)", amount: 9650 },
  { date: "2025-12-23", category: "ADS", description: "Instagram ads (2 days)", amount: 9358 },
  { date: "2025-12-24", category: "ADS", description: "Instagram ads (3 days)", amount: 11000 },
  { date: "2025-12-28", category: "ADS", description: "Instagram ads (2 days)", amount: 12400 },
  { date: "2025-12-30", category: "ADS", description: "Instagram ads (2 days)", amount: 16000 },
  { date: "2026-01-03", category: "ADS", description: "Instagram verified subscription (1 month)", amount: 4500 },
  { date: "2026-01-04", category: "DELIVERY", description: "Giveaway delivery to Nyanya", amount: 5000 },
  { date: "2026-01-06", category: "ADS", description: "Instagram ads (2 days)", amount: 15300 },
];

const DAY = 24 * 60 * 60 * 1000;

// Fill missing dates by linear interpolation between anchored rows,
// extrapolating the tail at the same pace as the last anchored segment.
function resolveDates(rows: LegacySale[]): { date: Date; estimated: boolean }[] {
  const anchors: { idx: number; t: number }[] = rows.flatMap((r, idx) =>
    r.date ? [{ idx, t: new Date(r.date + "T12:00:00Z").getTime() }] : []
  );
  const out: { date: Date; estimated: boolean }[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].date) {
      out.push({ date: new Date(rows[i].date + "T12:00:00Z"), estimated: false });
      continue;
    }
    const prev = [...anchors].reverse().find((a) => a.idx < i);
    const next = anchors.find((a) => a.idx > i);
    let t: number;
    if (prev && next) {
      t = prev.t + ((next.t - prev.t) * (i - prev.idx)) / (next.idx - prev.idx);
    } else if (prev) {
      // extrapolate past the last anchor at the overall average pace
      const first = anchors[0];
      const last = anchors[anchors.length - 1];
      const pace = last.idx > first.idx ? (last.t - first.t) / (last.idx - first.idx) : DAY;
      t = prev.t + pace * (i - prev.idx);
    } else {
      t = next!.t;
    }
    out.push({ date: new Date(Math.round(t / DAY) * DAY + 12 * 60 * 60 * 1000), estimated: true });
  }
  return out;
}

async function main() {
  // Idempotency guard: any pre-Feb-2026 sale, or the bulk caps order expense,
  // means this import already ran. (The Batch 2 seed's "150 Caps — New Stock"
  // expense on 2026-01-18 is the one legitimate pre-Feb record and is excluded.)
  const [existingSales, fingerprint] = await Promise.all([
    prisma.sale.count({ where: { date: { lt: CUTOFF } } }),
    prisma.expense.count({ where: { amount: 761743 } }),
  ]);
  if (existingSales > 0 || fingerprint > 0) {
    console.log(
      `Legacy records already present (pre-Feb sales: ${existingSales}, bulk-order expense: ${fingerprint}). Aborting to avoid duplicates.`
    );
    return;
  }

  const dates = resolveDates(legacySales);

  const saleRows = legacySales.map((s, i) => {
    const noteParts: string[] = [];
    if (s.notes) noteParts.push(s.notes);
    if (dates[i].estimated) noteParts.push("Date estimated — source sheet row had no date");
    else if (s.anchored && s.anchored !== "dated in sheet") noteParts.push(`Date anchored: ${s.anchored}`);
    return {
      date: dates[i].date,
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
      notes: noteParts.length ? noteParts.join(". ") : null,
      deductedStock: false,
    };
  });

  const expenseRows = legacyExpenses.map((e) => ({
    date: new Date(e.date + "T12:00:00Z"),
    category: e.category,
    description: e.description,
    amount: e.amount,
  }));

  const totals = {
    sales: saleRows.length,
    units: saleRows.reduce((a, r) => a + r.quantity, 0),
    collected: saleRows.reduce((a, r) => a + r.totalCollected, 0),
    profit: saleRows.reduce((a, r) => a + (r.profit ?? 0), 0),
    expenses: expenseRows.length,
    expenseTotal: expenseRows.reduce((a, r) => a + r.amount, 0),
  };

  console.log(`Sales: ${totals.sales} rows, ${totals.units} units, collected ₦${totals.collected.toLocaleString()}, profit ₦${totals.profit.toLocaleString()}`);
  console.log(`  (sheet's own totals: 70 units, profit ₦1,536,150 — excludes the PENDING-sheet sale)`);
  console.log(`Expenses: ${totals.expenses} rows, total ₦${totals.expenseTotal.toLocaleString()}`);
  console.log(`Date range: ${saleRows[0].date.toISOString().slice(0, 10)} → ${saleRows[saleRows.length - 1].date.toISOString().slice(0, 10)} (estimated dates flagged in notes)`);

  if (DRY_RUN) {
    for (const r of saleRows) {
      console.log(
        `  ${r.date.toISOString().slice(0, 10)}  ${r.customerName.padEnd(18)} x${r.quantity}  ₦${r.totalCollected.toLocaleString().padStart(8)}  ${r.paymentStatus}${r.notes ? `  [${r.notes}]` : ""}`
      );
    }
    console.log("Dry run — nothing written.");
    return;
  }

  await prisma.sale.createMany({ data: saleRows });
  await prisma.expense.createMany({ data: expenseRows });
  console.log("Imported successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

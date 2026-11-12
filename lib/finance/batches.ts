import { prisma } from "@/lib/db/prisma";
import type { Brand } from "@prisma/client";
import { batchLandedTotal } from "@/lib/inventory/lots";

const N = (x: unknown) => Number(x ?? 0);

// Sales that count as earned. PENDING units are sold but not yet paid for.
const REALISED = new Set(["PAID", "PARTIAL"]);

export type BatchLotStats = {
  id: string;
  inventoryItemId: string;
  name: string;
  size: string | null;
  category: string;
  quantityReceived: number;
  quantityRemaining: number;
  unitsSold: number;
  unitCost: number;
  landedUnitCost: number;
};

export type BatchStats = {
  id: string;
  label: string;
  orderDate: string;
  receivedAt: string | null;
  status: string;
  supplier: string | null;
  notes: string | null;
  isOpening: boolean;
  // Investment
  purchaseValue: number; // lots × purchase price
  linkedStock: number; // STOCK payments linked as batch cost
  linkedExtras: number; // freight, customs… linked as batch cost
  landedTotal: number; // total inventory investment in this batch
  // Movement
  unitsReceived: number;
  unitsSold: number; // paid + partial
  unitsAwaitingPayment: number; // pending sales
  unitsRemaining: number;
  sellThroughPct: number;
  // Results (paid + partial sales only)
  revenue: number; // collected, shared across a sale's items by value
  cogs: number; // landed cost of the units sold
  delivery: number; // delivery paid out on those sales, shared the same way
  grossProfit: number; // revenue − cogs − delivery
  attributed: { category: string; amount: number }[]; // expenses tagged to the batch
  netProfit: number; // gross − attributed expenses
  recovered: number; // capital recovered = cogs (landed cost of units sold)
  remainingValue: number; // capital still on the shelf
  lots: BatchLotStats[];
  expenses: {
    id: string;
    date: string;
    category: string;
    description: string | null;
    amount: number;
    inBatchCost: boolean;
  }[];
};

export async function getBatchStats(brand: Brand, id?: string): Promise<BatchStats[]> {
  const batches = await prisma.stockBatch.findMany({
    where: { brand, ...(id ? { id } : {}) },
    orderBy: [{ isOpening: "desc" }, { orderDate: "asc" }],
    include: {
      expenses: { orderBy: { date: "asc" } },
      lots: {
        include: {
          allocations: {
            include: {
              saleItem: {
                include: {
                  sale: {
                    select: {
                      paymentStatus: true,
                      totalCollected: true,
                      deliveryFee: true,
                      items: { select: { quantity: true, unitPrice: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const itemIds = [...new Set(batches.flatMap((b) => b.lots.map((l) => l.inventoryItemId)))];
  const inv = await prisma.inventoryItem.findMany({
    where: { id: { in: itemIds } },
    select: { id: true, name: true, size: true, category: true },
  });
  const invById = new Map(inv.map((i) => [i.id, i]));

  return batches.map((b) => {
    let unitsSold = 0;
    let awaiting = 0;
    let revenue = 0;
    let cogs = 0;
    let delivery = 0;

    const lots: BatchLotStats[] = b.lots.map((l) => {
      let lotSold = 0;
      for (const a of l.allocations) {
        const sale = a.saleItem.sale;
        if (!REALISED.has(sale.paymentStatus)) {
          if (sale.paymentStatus === "PENDING") awaiting += a.quantity;
          continue;
        }
        // This allocation's share of the sale, by item value.
        const saleValue = sale.items.reduce((s, i) => s + i.quantity * N(i.unitPrice), 0);
        const share = saleValue > 0 ? (a.quantity * N(a.saleItem.unitPrice)) / saleValue : 0;
        revenue += share * N(sale.totalCollected);
        delivery += share * N(sale.deliveryFee);
        cogs += a.quantity * N(a.unitCost);
        unitsSold += a.quantity;
        lotSold += a.quantity;
      }
      const item = invById.get(l.inventoryItemId);
      return {
        id: l.id,
        inventoryItemId: l.inventoryItemId,
        name: item?.name ?? "Deleted item",
        size: item?.size ?? null,
        category: item?.category ?? "OTHER",
        quantityReceived: l.quantityReceived,
        quantityRemaining: l.quantityRemaining,
        unitsSold: lotSold,
        unitCost: N(l.unitCost),
        landedUnitCost: N(l.landedUnitCost),
      };
    });

    const purchaseValue = lots.reduce((s, l) => s + l.quantityReceived * l.unitCost, 0);
    const costExp = b.expenses.filter((e) => e.inBatchCost);
    const linkedStock = costExp
      .filter((e) => e.category === "STOCK")
      .reduce((s, e) => s + N(e.amount), 0);
    const linkedExtras = costExp
      .filter((e) => e.category !== "STOCK")
      .reduce((s, e) => s + N(e.amount), 0);
    // Before the stock arrives there are no lots: the investment is what's paid.
    const landedTotal = batchLandedTotal(purchaseValue, linkedStock, linkedExtras);

    const byCat: Record<string, number> = {};
    for (const e of b.expenses.filter((x) => !x.inBatchCost)) {
      byCat[e.category] = (byCat[e.category] || 0) + N(e.amount);
    }
    const attributed = Object.entries(byCat).map(([category, amount]) => ({ category, amount }));
    const attributedTotal = attributed.reduce((s, a) => s + a.amount, 0);

    const unitsReceived = lots.reduce((s, l) => s + l.quantityReceived, 0);
    const unitsRemaining = lots.reduce((s, l) => s + l.quantityRemaining, 0);
    const remainingValue = lots.reduce((s, l) => s + l.quantityRemaining * l.landedUnitCost, 0);
    const grossProfit = revenue - cogs - delivery;

    return {
      id: b.id,
      label: b.label,
      orderDate: b.orderDate.toISOString(),
      receivedAt: b.receivedAt?.toISOString() ?? null,
      status: b.status,
      supplier: b.supplier,
      notes: b.notes,
      isOpening: b.isOpening,
      purchaseValue,
      linkedStock,
      linkedExtras,
      landedTotal,
      unitsReceived,
      unitsSold,
      unitsAwaitingPayment: awaiting,
      unitsRemaining,
      sellThroughPct: unitsReceived ? Math.round((unitsSold / unitsReceived) * 1000) / 10 : 0,
      revenue: Math.round(revenue),
      cogs: Math.round(cogs),
      delivery: Math.round(delivery),
      grossProfit: Math.round(grossProfit),
      attributed,
      netProfit: Math.round(grossProfit - attributedTotal),
      recovered: Math.round(cogs),
      remainingValue: Math.round(remainingValue),
      lots,
      expenses: b.expenses.map((e) => ({
        id: e.id,
        date: e.date.toISOString(),
        category: e.category,
        description: e.description,
        amount: N(e.amount),
        inBatchCost: e.inBatchCost,
      })),
    };
  });
}

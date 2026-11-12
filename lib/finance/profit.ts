import { prisma } from "@/lib/db/prisma";
import type { Brand } from "@prisma/client";

// Real profit = collected − landed cost of the items − delivery paid out.
// Same formula the sale POST uses when profit is left blank. Uses the cost
// recorded on the sale (from its stock lots) when present, else the inventory
// cost price. Only sales whose every line item is linked to inventory with a
// known cost can be calculated.
// Pending/returned sales are skipped: nothing has been earned on them yet.

export type ProfitRecalcRow = {
  id: string;
  date: string;
  customerName: string;
  productText: string;
  paymentStatus: string;
  totalCollected: number;
  current: number | null;
  calculated: number;
};

export async function calculateSaleProfits(
  brand: Brand,
  ids?: string[]
): Promise<ProfitRecalcRow[]> {
  const sales = await prisma.sale.findMany({
    where: {
      brand,
      paymentStatus: { in: ["PAID", "PARTIAL"] },
      ...(ids ? { id: { in: ids } } : {}),
    },
    orderBy: { date: "desc" },
    include: { items: true },
  });

  const invIds = [
    ...new Set(
      sales.flatMap((s) =>
        s.items.map((i) => i.inventoryItemId).filter((id): id is string => !!id)
      )
    ),
  ];
  const inv = await prisma.inventoryItem.findMany({
    where: { id: { in: invIds } },
    select: { id: true, costPrice: true },
  });
  const costById = new Map(
    inv.map((i) => [i.id, i.costPrice === null ? null : Number(i.costPrice)])
  );

  const rows: ProfitRecalcRow[] = [];
  for (const s of sales) {
    if (s.items.length === 0) continue;
    let cogs = 0;
    let costed = true;
    for (const it of s.items) {
      // Lot-tracked items carry the landed cost recognised at sale time.
      const cost =
        it.unitCost !== null
          ? Number(it.unitCost)
          : it.inventoryItemId
            ? costById.get(it.inventoryItemId)
            : null;
      if (cost === null || cost === undefined) {
        costed = false;
        break;
      }
      cogs += it.quantity * cost;
    }
    if (!costed) continue;

    const collected = Number(s.totalCollected);
    const calculated = collected - cogs - Number(s.deliveryFee ?? 0);
    rows.push({
      id: s.id,
      date: s.date.toISOString(),
      customerName: s.customerName,
      productText: s.productText,
      paymentStatus: s.paymentStatus,
      totalCollected: collected,
      current: s.profit === null ? null : Number(s.profit),
      calculated,
    });
  }
  return rows;
}

// Rows whose stored profit is missing or off by more than ₦1.
export const needsUpdate = (r: ProfitRecalcRow) =>
  r.current === null || Math.abs(r.current - r.calculated) > 1;

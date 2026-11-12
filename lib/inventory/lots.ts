import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export type LotDraw = { lotId: string; quantity: number; unitCost: number };

// Draw `quantity` units of an inventory item from its stock lots, oldest
// received batch first (FIFO), so old and new stock can sell side by side. Returns the draws
// and the weighted unit cost. Units not covered by any lot (stock added by a
// manual recount) fall back to the item's costPrice and are not drawn.
export async function drawFromLots(
  tx: Tx,
  inventoryItemId: string,
  quantity: number
): Promise<{ draws: LotDraw[]; unitCost: number | null }> {
  const lots = await tx.stockLot.findMany({
    where: { inventoryItemId, quantityRemaining: { gt: 0 } },
    // Oldest stock on the shelf first: by when the batch arrived.
    orderBy: [{ batch: { receivedAt: "asc" } }, { createdAt: "asc" }],
    select: { id: true, quantityRemaining: true, landedUnitCost: true },
  });

  const draws: LotDraw[] = [];
  let left = quantity;
  for (const lot of lots) {
    if (left === 0) break;
    const take = Math.min(left, lot.quantityRemaining);
    await tx.stockLot.update({
      where: { id: lot.id },
      data: { quantityRemaining: { decrement: take } },
    });
    draws.push({ lotId: lot.id, quantity: take, unitCost: Number(lot.landedUnitCost) });
    left -= take;
  }

  let total = draws.reduce((s, d) => s + d.quantity * d.unitCost, 0);
  if (left > 0) {
    const inv = await tx.inventoryItem.findUnique({
      where: { id: inventoryItemId },
      select: { costPrice: true },
    });
    if (inv?.costPrice == null) return { draws, unitCost: null };
    total += left * Number(inv.costPrice);
  }
  return { draws, unitCost: total / quantity };
}

// Put a sale's units back: lots it drew from and the shelf quantity. Used when
// a lot-tracked sale is deleted, returned, or has its items replaced.
export async function restoreSaleStock(tx: Tx, saleId: string) {
  const items = await tx.saleItem.findMany({
    where: { saleId },
    include: { lots: true },
  });
  for (const it of items) {
    for (const a of it.lots) {
      await tx.stockLot.update({
        where: { id: a.lotId },
        data: { quantityRemaining: { increment: a.quantity } },
      });
    }
    if (it.inventoryItemId) {
      await tx.inventoryItem.updateMany({
        where: { id: it.inventoryItemId },
        data: { quantity: { increment: it.quantity } },
      });
    }
    await tx.saleItemLot.deleteMany({ where: { saleItemId: it.id } });
  }
}

// A sale is lot-tracked once any of its items drew from a lot. Older sales
// keep their original stock behaviour.
export async function isLotTracked(tx: Tx, saleId: string) {
  const n = await tx.saleItemLot.count({ where: { saleItem: { saleId } } });
  return n > 0;
}

// Total landed cost of a batch. Purchase = the lots' purchase value, or the
// linked STOCK payments if those are higher (a supplier bill that already
// includes delivery). Freight, customs etc. are the other linked costs.
export function batchLandedTotal(
  purchaseValue: number,
  linkedStock: number,
  linkedExtras: number
) {
  return Math.max(purchaseValue, linkedStock) + linkedExtras;
}

// Spread the landed total across the batch's lots in proportion to purchase
// value, and carry the new cost onto units already sold from those lots.
export async function recomputeLandedCosts(tx: Tx, batchId: string) {
  const [lots, linked] = await Promise.all([
    tx.stockLot.findMany({ where: { batchId } }),
    tx.expense.groupBy({
      by: ["category"],
      where: { batchId, inBatchCost: true },
      _sum: { amount: true },
    }),
  ]);
  const purchase = lots.reduce(
    (s, l) => s + l.quantityReceived * Number(l.unitCost),
    0
  );
  const stock = Number(linked.find((g) => g.category === "STOCK")?._sum.amount ?? 0);
  const extras = linked
    .filter((g) => g.category !== "STOCK")
    .reduce((s, g) => s + Number(g._sum.amount ?? 0), 0);
  const factor = purchase > 0 ? batchLandedTotal(purchase, stock, extras) / purchase : 1;

  const touched = new Set<string>();
  for (const l of lots) {
    const landed = Math.round(Number(l.unitCost) * factor * 100) / 100;
    await tx.stockLot.update({ where: { id: l.id }, data: { landedUnitCost: landed } });
    const allocs = await tx.saleItemLot.findMany({
      where: { lotId: l.id },
      select: { saleItemId: true },
    });
    if (allocs.length) {
      await tx.saleItemLot.updateMany({ where: { lotId: l.id }, data: { unitCost: landed } });
      allocs.forEach((a) => touched.add(a.saleItemId));
    }
  }
  for (const saleItemId of touched) await refreshSaleItemCost(tx, saleItemId);
}

// saleItem.unitCost = weighted cost of the lots it drew from (plus any units
// that fell back to the item's costPrice).
async function refreshSaleItemCost(tx: Tx, saleItemId: string) {
  const it = await tx.saleItem.findUnique({
    where: { id: saleItemId },
    include: { lots: true },
  });
  if (!it) return;
  const drawn = it.lots.reduce((s, a) => s + a.quantity, 0);
  let total = it.lots.reduce((s, a) => s + a.quantity * Number(a.unitCost), 0);
  if (drawn < it.quantity) {
    const inv = it.inventoryItemId
      ? await tx.inventoryItem.findUnique({
          where: { id: it.inventoryItemId },
          select: { costPrice: true },
        })
      : null;
    if (inv?.costPrice == null) return;
    total += (it.quantity - drawn) * Number(inv.costPrice);
  }
  await tx.saleItem.update({
    where: { id: saleItemId },
    data: { unitCost: total / it.quantity },
  });
}

export class OversellError extends Error {}

// Deduct shelf stock and draw lots for every linked item of a sale (used when
// a lot-tracked sale's items are replaced). Returns the cost of goods, or null
// if any item has no known cost.
export async function deductSaleStock(tx: Tx, saleId: string) {
  const items = await tx.saleItem.findMany({ where: { saleId } });
  let cogs = 0;
  let costed = true;
  for (const it of items) {
    if (!it.inventoryItemId) {
      costed = false;
      continue;
    }
    const inv = await tx.inventoryItem.findUnique({
      where: { id: it.inventoryItemId },
      select: { quantity: true, name: true, size: true },
    });
    if (!inv) {
      costed = false;
      continue;
    }
    if (it.quantity > inv.quantity) {
      throw new OversellError(
        `Only ${inv.quantity} of "${inv.name}${inv.size ? ` [${inv.size}]` : ""}" in stock — check the size, or recount first.`
      );
    }
    await tx.inventoryItem.update({
      where: { id: it.inventoryItemId },
      data: { quantity: { decrement: it.quantity } },
    });
    const { draws, unitCost } = await drawFromLots(tx, it.inventoryItemId, it.quantity);
    if (draws.length) {
      await tx.saleItemLot.createMany({
        data: draws.map((d) => ({ saleItemId: it.id, ...d })),
      });
    }
    if (unitCost === null) costed = false;
    else {
      cogs += unitCost * it.quantity;
      await tx.saleItem.update({ where: { id: it.id }, data: { unitCost } });
    }
  }
  return costed ? cogs : null;
}

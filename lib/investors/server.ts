import type { Prisma } from "@prisma/client";
import { serializeInvestment } from "./serialize";

type Tx = Prisma.TransactionClient;

export const loadInvestment = (tx: Tx, id: string) =>
  tx.investment.findUnique({
    where: { id },
    include: { payouts: { orderBy: { date: "desc" } } },
  });

// Keep status honest after money moves: PAID_OUT once capital is fully due
// and everything owed is paid; back to ACTIVE if a payout is undone.
export async function syncStatus(tx: Tx, id: string) {
  const row = await loadInvestment(tx, id);
  if (!row || row.status === "CANCELLED") return row;
  const { metrics, amount } = serializeInvestment(row);
  const settled =
    metrics.outstanding <= 0 &&
    metrics.dueNow <= 0 &&
    metrics.principalEarned >= amount;
  const next = settled
    ? "PAID_OUT"
    : row.status === "PAID_OUT"
      ? "ACTIVE"
      : row.status;
  if (next !== row.status) {
    return tx.investment.update({
      where: { id },
      data: { status: next },
      include: { payouts: { orderBy: { date: "desc" } } },
    });
  }
  return row;
}

// Delete payouts' linked INVESTOR_RETURN expenses.
export async function deleteLinkedExpenses(tx: Tx, expenseIds: (string | null)[]) {
  const ids = expenseIds.filter((x): x is string => !!x);
  if (ids.length) await tx.expense.deleteMany({ where: { id: { in: ids } } });
}

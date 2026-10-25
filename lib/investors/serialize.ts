import type { Prisma } from "@prisma/client";
import { computeInvestment, type InvestmentMetrics } from "./calc";

// Shared Prisma include + serializer so every investor route returns the same
// shape: Decimals as numbers, plus computed metrics per investment.

export const investorInclude = {
  investments: {
    orderBy: { startDate: "desc" },
    include: { payouts: { orderBy: { date: "desc" } } },
  },
} satisfies Prisma.InvestorInclude;

type InvestorRow = Prisma.InvestorGetPayload<{ include: typeof investorInclude }>;
type InvestmentRow = InvestorRow["investments"][number];

const num = (d: Prisma.Decimal | null) => (d === null ? null : Number(d));

export function serializeInvestment(inv: InvestmentRow, now = new Date()) {
  const payouts = inv.payouts.map((p) => ({
    id: p.id,
    date: p.date.toISOString(),
    amount: Number(p.amount),
    type: p.type,
    expenseId: p.expenseId,
    notes: p.notes,
  }));
  const plain = {
    id: inv.id,
    investorId: inv.investorId,
    planType: inv.planType,
    planName: inv.planName,
    amount: Number(inv.amount),
    startDate: inv.startDate.toISOString(),
    termMonths: inv.termMonths,
    batchLabel: inv.batchLabel,
    unitsFunded: inv.unitsFunded,
    unitCost: num(inv.unitCost),
    perUnitReturn: num(inv.perUnitReturn),
    unitsSold: inv.unitsSold,
    fixedRatePct: num(inv.fixedRatePct),
    status: inv.status,
    notes: inv.notes,
    payouts,
  };
  const metrics: InvestmentMetrics = computeInvestment(plain, now);
  return { ...plain, metrics };
}

export function serializeInvestor(row: InvestorRow, now = new Date()) {
  const investments = row.investments.map((i) => serializeInvestment(i, now));
  const live = investments.filter((i) => i.status !== "CANCELLED");
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    investments,
    totals: {
      invested: live.reduce((a, i) => a + i.amount, 0),
      activeCapital: live
        .filter((i) => i.status !== "PAID_OUT")
        .reduce((a, i) => a + i.amount - i.metrics.principalPaid, 0),
      paid: investments.reduce((a, i) => a + i.metrics.totalPaid, 0),
      returnsPaid: investments.reduce((a, i) => a + i.metrics.returnPaid, 0),
      dueNow: live.reduce((a, i) => a + i.metrics.dueNow, 0),
      outstanding: live.reduce((a, i) => a + i.metrics.outstanding, 0),
    },
  };
}

export type SerializedInvestor = ReturnType<typeof serializeInvestor>;
export type SerializedInvestment = ReturnType<typeof serializeInvestment>;

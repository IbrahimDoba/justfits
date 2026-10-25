// Pure money math for an investment, shared by the API and the admin UI.
// Works on plain numbers (Decimals already converted).

export interface InvestmentLike {
  planType: "PER_UNIT" | "FIXED_RETURN";
  amount: number;
  startDate: string | Date;
  termMonths: number;
  unitsFunded: number | null;
  unitCost: number | null;
  perUnitReturn: number | null;
  unitsSold: number;
  fixedRatePct: number | null;
  status: "ACTIVE" | "MATURED" | "PAID_OUT" | "CANCELLED";
  payouts: { amount: number; type: "PRINCIPAL" | "RETURN" }[];
}

export interface InvestmentMetrics {
  maturityDate: string; // ISO
  projectedReturn: number; // investor profit if the deal runs fully
  projectedTotal: number; // capital + projected profit
  principalEarned: number; // capital that should have been handed back by now
  returnEarned: number; // profit earned by now
  principalPaid: number;
  returnPaid: number;
  totalPaid: number;
  principalDue: number; // payable right now
  returnDue: number;
  dueNow: number;
  outstanding: number; // total still owed over the life of the deal
  progressPct: number; // pieces sold or time elapsed
  isMatured: boolean;
  isOverdue: boolean; // matured with money still owed
  isDueSoon: boolean; // matures within 14 days
}

const DAY = 86_400_000;

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const clamp0 = (n: number) => Math.max(0, Math.round(n));

export function computeInvestment(
  inv: InvestmentLike,
  now: Date = new Date()
): InvestmentMetrics {
  const start = new Date(inv.startDate);
  const maturity = addMonths(start, inv.termMonths);
  const isMatured = now >= maturity || inv.status === "MATURED";

  const principalPaid = sum(
    inv.payouts.filter((p) => p.type === "PRINCIPAL").map((p) => p.amount)
  );
  const returnPaid = sum(
    inv.payouts.filter((p) => p.type === "RETURN").map((p) => p.amount)
  );

  let projectedReturn = 0;
  let principalEarned = 0;
  let returnEarned = 0;
  let progressPct = 0;

  if (inv.planType === "PER_UNIT") {
    const units = inv.unitsFunded ?? 0;
    const cost = inv.unitCost ?? 0;
    const per = inv.perUnitReturn ?? 0;
    const sold = Math.min(inv.unitsSold, units || inv.unitsSold);
    const allSold = units > 0 && sold >= units;
    returnEarned = sold * per;
    // Before the deadline we project every piece selling; once it passes,
    // unsold pieces earn nothing (they're bought back at cost only).
    projectedReturn = isMatured ? returnEarned : units * per;
    // Each sale hands back that piece's cost; once everything has sold or
    // the deadline passes (buyback), the full capital is due.
    principalEarned =
      isMatured || allSold ? inv.amount : Math.min(inv.amount, sold * cost);
    progressPct = units ? Math.round((sold / units) * 100) : 0;
  } else {
    const rate = inv.fixedRatePct ?? 0;
    projectedReturn = Math.round((inv.amount * rate) / 100);
    principalEarned = isMatured ? inv.amount : 0;
    returnEarned = isMatured ? projectedReturn : 0;
    const span = maturity.getTime() - start.getTime();
    progressPct = span
      ? Math.min(100, Math.max(0, Math.round(((now.getTime() - start.getTime()) / span) * 100)))
      : 0;
  }

  const projectedTotal = inv.amount + projectedReturn;
  const totalPaid = principalPaid + returnPaid;
  const cancelled = inv.status === "CANCELLED";
  const principalDue = cancelled ? 0 : clamp0(principalEarned - principalPaid);
  const returnDue = cancelled ? 0 : clamp0(returnEarned - returnPaid);
  const outstanding = cancelled ? 0 : clamp0(projectedTotal - totalPaid);
  const msToMaturity = maturity.getTime() - now.getTime();

  return {
    maturityDate: maturity.toISOString(),
    projectedReturn,
    projectedTotal,
    principalEarned,
    returnEarned,
    principalPaid,
    returnPaid,
    totalPaid,
    principalDue,
    returnDue,
    dueNow: principalDue + returnDue,
    outstanding,
    progressPct,
    isMatured,
    isOverdue: isMatured && outstanding > 0 && !cancelled && inv.status !== "PAID_OUT",
    isDueSoon:
      !isMatured && msToMaturity <= 14 * DAY && outstanding > 0 && !cancelled,
  };
}

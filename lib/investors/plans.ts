// Investment plans JUSTFITS offers. These are templates that prefill the
// "New investment" form; every deal stores its own terms, so changing a
// template never alters existing investments.

export type PlanType = "PER_UNIT" | "FIXED_RETURN";

export interface PlanTemplate {
  key: string;
  type: PlanType;
  name: string;
  tagline: string;
  minAmount: number;
  termMonths: number;
  unitCost?: number; // PER_UNIT: landed cost per piece
  perUnitReturn?: number; // PER_UNIT: investor profit per piece sold
  fixedRatePct?: number; // FIXED_RETURN: % paid on top of capital at maturity
  points: string[];
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    key: "per-piece",
    type: "PER_UNIT",
    name: "Per-Piece Partner",
    tagline: "Earn on every piece sold. Target ~1.5-2 months.",
    minAmount: 500_000,
    termMonths: 3,
    unitCost: 12_800,
    perUnitReturn: 6_000,
    points: [
      "Your money funds a set number of pieces in the next restock",
      "For every piece sold you get its cost back plus ₦6,000 profit",
      "Paid out as pieces sell, typically within 1.5-2 months",
      "Anything unsold at 3 months is bought back at cost, so your capital is protected",
    ],
  },
  {
    key: "stock-note",
    type: "FIXED_RETURN",
    name: "Stock Note",
    tagline: "Fixed 15% in 4 months. Simple and predictable.",
    minAmount: 200_000,
    termMonths: 4,
    fixedRatePct: 15,
    points: [
      "Fixed 15% return on top of your capital",
      "Capital and return paid together at the end of 4 months",
      "Return doesn't depend on how fast stock sells",
    ],
  },
];

export const getPlanTemplate = (key: string) =>
  PLAN_TEMPLATES.find((p) => p.key === key) ?? null;

export interface Scenario {
  label: string;
  total: number; // everything the investor receives back
  profit: number; // total − capital
}

// What an investor would receive under different sell-through outcomes.
export function projectPerUnit(
  amount: number,
  unitCost: number,
  perUnitReturn: number
): { units: number; scenarios: Scenario[] } {
  const units = unitCost > 0 ? Math.floor(amount / unitCost) : 0;
  const scenarios = [0.5, 0.7, 1].map((share) => {
    const sold = Math.floor(units * share);
    // capital always comes back (sales + buyback of unsold at cost)
    const profit = sold * perUnitReturn;
    return {
      label: share === 1 ? "All sold" : `${share * 100}% sold`,
      total: amount + profit,
      profit,
    };
  });
  return { units, scenarios };
}

export function projectFixed(amount: number, ratePct: number): Scenario {
  const profit = Math.round((amount * ratePct) / 100);
  return { label: "At maturity", total: amount + profit, profit };
}

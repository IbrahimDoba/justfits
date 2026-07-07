// Shared finance constants used by API routes and admin UI.

export const EXPENSE_CATEGORIES = [
  "STOCK",
  "PACKAGING",
  "ADS",
  "DELIVERY",
  "LOSS",
  "RENT",
  "SALARIES",
  "FEES",
  "OTHER",
] as const;

export const PAYMENT_STATUSES = ["PAID", "PARTIAL", "PENDING"] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

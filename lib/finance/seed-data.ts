// Real historical finance data imported from Batch_2_edited_4.xlsx
// (Sales + Expenses sheets). Excel serial dates normalised to ISO. Amounts NGN.
// Shared by the CLI seed (prisma/seed-finance.ts) and the admin import endpoint.

export type SaleSeed = {
  date: string;
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
  notes?: string | null;
};

export type ExpenseCategory =
  | "STOCK"
  | "PACKAGING"
  | "ADS"
  | "DELIVERY"
  | "LOSS"
  | "RENT"
  | "SALARIES"
  | "FEES"
  | "OTHER";

export type ExpenseSeed = {
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
};

export const financeSeedSales: SaleSeed[] = [
  { date: "2026-02-24", customerName: "Onileowo", productText: "BOSS", variantText: "Black", quantity: 1, unitPrice: 35000, deliveryFee: null, deliveryPaidBy: "Him", totalCollected: 35000, profit: 35000, paymentStatus: "PAID", notes: "Delivery: Paid" },
  { date: "2026-02-25", customerName: "Nadia", productText: "Benz", variantText: "Black/Pink & Black (AMG)", quantity: 2, unitPrice: 30000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 60000, profit: 60000, paymentStatus: "PAID" },
  { date: "2026-03-02", customerName: "CarsConnect (CN)", productText: "Benz", variantText: "Black, B/W, White, Black/Red", quantity: 4, unitPrice: 22500, deliveryFee: null, deliveryPaidBy: null, totalCollected: 90000, profit: 90000, paymentStatus: "PAID" },
  { date: "2026-03-01", customerName: "Jumai", productText: "Ferrari", variantText: "Black/Red (Batch1)", quantity: 1, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: "Her", totalCollected: 27500, profit: 25000, paymentStatus: "PAID", notes: "Delivery: Paid" },
  { date: "2026-03-02", customerName: "Perry", productText: "Benz", variantText: "AMG (Black)", quantity: 1, unitPrice: 33000, deliveryFee: null, deliveryPaidBy: "Him", totalCollected: 35000, profit: 33000, paymentStatus: "PAID", notes: "Delivery: Paid" },
  { date: "2026-03-07", customerName: "Bayo", productText: "BMW", variantText: "Black (Black with Stripes)", quantity: 1, unitPrice: 35000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 35000, profit: 35000, paymentStatus: "PAID" },
  { date: "2026-03-03", customerName: "Murtala Datti", productText: "Benz", variantText: "Blue, Black", quantity: 2, unitPrice: 35000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 70000, profit: 70000, paymentStatus: "PAID" },
  { date: "2026-03-03", customerName: "Martins Enebi", productText: "Benz", variantText: "White (Batch 1)", quantity: 1, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 25000, profit: 25000, paymentStatus: "PAID" },
  { date: "2026-03-17", customerName: "Perry", productText: "Benz/Ferrari", variantText: "Benz White/Black, Ferrari Red", quantity: 2, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: null, totalCollected: 50000, profit: 50000, paymentStatus: "PAID" },
  { date: "2026-03-23", customerName: "OJ1", productText: "Benz", variantText: "Navy Blue, Pink / Red", quantity: 2, unitPrice: 30000, deliveryFee: null, deliveryPaidBy: "Me", totalCollected: 60000, profit: 58600, paymentStatus: "PAID", notes: "Delivery: Paid (absorbed ~1,400)" },
  { date: "2026-03-24", customerName: "Bauchi Harry", productText: "Ferrari", variantText: "Red", quantity: 1, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: "Both", totalCollected: 30000, profit: 23300, paymentStatus: "PAID", notes: "Delivery: Paid (split)" },
  { date: "2026-03-28", customerName: "Ajibola", productText: "BMW", variantText: "Black", quantity: 1, unitPrice: 30000, deliveryFee: null, deliveryPaidBy: "Him", totalCollected: 36000, profit: 30000, paymentStatus: "PAID", notes: "Delivery: Paid" },
  { date: "2026-03-29", customerName: "Ajibola", productText: "BMW/Ferrari", variantText: "White/Black", quantity: 2, unitPrice: 27500, deliveryFee: null, deliveryPaidBy: "Him", totalCollected: 59500, profit: 50500, paymentStatus: "PAID", notes: "Delivery: Paid" },
  { date: "2026-04-29", customerName: "Jummai", productText: "Benz", variantText: "Black/Navy Blue", quantity: 2, unitPrice: 26000, deliveryFee: null, deliveryPaidBy: "Her", totalCollected: 52000, profit: 52000, paymentStatus: "PAID", notes: "Delivery: Paid" },
  { date: "2026-05-15", customerName: "Samuel", productText: "Benz", variantText: "Black/White", quantity: 2, unitPrice: 26000, deliveryFee: null, deliveryPaidBy: "Him", totalCollected: 57000, profit: 50000, paymentStatus: "PAID", notes: "Delivery: Paid" },
  { date: "2026-05-15", customerName: "Anthony", productText: "Benz", variantText: "Black/White", quantity: 2, unitPrice: 26000, deliveryFee: null, deliveryPaidBy: "Him", totalCollected: 61000, profit: 50000, paymentStatus: "PAID", notes: "Delivery: Paid" },
  { date: "2026-05-16", customerName: "Tumburawa", productText: "Benz/Boss/Ferrari", variantText: "Benz/Boss/Ferrari", quantity: 6, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: "Pickup", totalCollected: 150000, profit: 150000, paymentStatus: "PAID" },
  { date: "2026-05-16", customerName: "Aliyu", productText: "Benz", variantText: "Black/White Benz", quantity: 2, unitPrice: 22500, deliveryFee: null, deliveryPaidBy: "Pickup", totalCollected: 45000, profit: 45000, paymentStatus: "PAID" },
  { date: "2026-05-19", customerName: "Ahmed Ibrahim", productText: "Benz", variantText: "Brown", quantity: 1, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: "Him", totalCollected: 28000, profit: 25000, paymentStatus: "PAID", notes: "Delivery: Paid" },
  { date: "2026-05-22", customerName: "Ford", productText: "Benz", variantText: "Full Black", quantity: 1, unitPrice: 25000, deliveryFee: null, deliveryPaidBy: "Pickup", totalCollected: 25000, profit: 25000, paymentStatus: "PAID" },
  { date: "2026-05-26", customerName: "Kabiru Zakari", productText: "Benz/BMW/Ferrari", variantText: "Green/White, Red Ferrari, Black BMW, Black Benz, White BMW, White Benz Petronas", quantity: 6, unitPrice: 26500, deliveryFee: null, deliveryPaidBy: "Him", totalCollected: 165000, profit: 159000, paymentStatus: "PAID", notes: "Delivery: Paid" },
  { date: "2026-06-05", customerName: "Ninani Musa", productText: "BMW", variantText: "White", quantity: 1, unitPrice: 25000, deliveryFee: 3900, deliveryPaidBy: null, totalCollected: 27000, profit: 23100, paymentStatus: "PAID", notes: "Delivery ₦3,900 (₦50 off)" },
  { date: "2026-07-06", customerName: "Abdullahi Danjuma", productText: "Benz", variantText: "Full Black", quantity: 1, unitPrice: 30000, deliveryFee: null, deliveryPaidBy: "Pickup", totalCollected: 30000, profit: 30000, paymentStatus: "PAID" },
  { date: "2026-06-10", customerName: "Ugoo Nwamba", productText: "Ferrari/Benz", variantText: "Red Ferrari/Black Benz", quantity: 2, unitPrice: 30000, deliveryFee: 3500, deliveryPaidBy: "Him", totalCollected: 62500, profit: 59000, paymentStatus: "PAID" },
  { date: "2026-06-10", customerName: "Obinna Kingsley", productText: "Benz", variantText: "Black Benz/Full Back Benz", quantity: 2, unitPrice: 25000, deliveryFee: 5000, deliveryPaidBy: "Him", totalCollected: 55000, profit: null, paymentStatus: "PAID", notes: "Profit: None yet" },
  { date: "2026-06-26", customerName: "Isaiah Lliya", productText: "Benz", variantText: "White", quantity: 2, unitPrice: 25000, deliveryFee: 3500, deliveryPaidBy: "Him", totalCollected: 53000, profit: 50000, paymentStatus: "PAID" },
  { date: "2026-06-26", customerName: "Maxwell Ogbutu", productText: "Benz", variantText: "White", quantity: 1, unitPrice: 25000, deliveryFee: 5000, deliveryPaidBy: "Him", totalCollected: 30000, profit: 25000, paymentStatus: "PAID" },
  { date: "2026-06-27", customerName: "Ninani Musa", productText: "Benz", variantText: "Black/Pink", quantity: 1, unitPrice: 23000, deliveryFee: 4200, deliveryPaidBy: "Him", totalCollected: 27000, profit: 23000, paymentStatus: "PAID" },
  { date: "2026-06-27", customerName: "ANegbe Ehizele", productText: "Benz", variantText: "Black/Pink", quantity: 1, unitPrice: 25000, deliveryFee: 5000, deliveryPaidBy: "Him", totalCollected: 30000, profit: 25000, paymentStatus: "PAID" },
  { date: "2026-06-27", customerName: "Waheed Akanji", productText: "Benz/Ferrari", variantText: "Black/Pink/Red", quantity: 2, unitPrice: 30000, deliveryFee: 5000, deliveryPaidBy: "Him", totalCollected: 30000, profit: null, paymentStatus: "PARTIAL", notes: "Half paid (₦30,000 of ~₦65,000); profit: None yet" },
  { date: "2026-06-27", customerName: "Isiah Iliya", productText: "Benz/Boss/BMW", variantText: "Green Benz/BMW White, Boss Black", quantity: 3, unitPrice: 20000, deliveryFee: 3000, deliveryPaidBy: "Him", totalCollected: 63000, profit: 60000, paymentStatus: "PAID" },
];

export const financeSeedExpenses: ExpenseSeed[] = [
  { date: "2026-01-18", category: "STOCK", description: "150 Caps — New Stock", amount: 1386000 },
  { date: "2026-02-01", category: "PACKAGING", description: "Paper bags, Custom nylon, Stickers", amount: 95000 },
  { date: "2026-03-03", category: "ADS", description: "Ads", amount: 15000 },
  { date: "2026-03-07", category: "ADS", description: "Ads", amount: 15700 },
  { date: "2026-11-03", category: "ADS", description: "Honda Civic Car Ads", amount: 13000 },
  { date: "2026-12-03", category: "ADS", description: "Instagram Ads", amount: 15000 },
  { date: "2026-03-16", category: "LOSS", description: "Money stolen", amount: 10000 },
  { date: "2026-03-17", category: "ADS", description: "Instagram Ads", amount: 15000 },
  { date: "2026-03-25", category: "ADS", description: "Meta Ads", amount: 10000 },
  { date: "2026-03-28", category: "ADS", description: "Meta Ads", amount: 15000 },
  { date: "2026-12-05", category: "ADS", description: "Meta Ads", amount: 6000 },
  { date: "2026-05-21", category: "ADS", description: "Meta Ads", amount: 12000 },
  { date: "2026-05-23", category: "ADS", description: "Meta Ads", amount: 11000 },
  { date: "2026-05-25", category: "ADS", description: "Meta Ads", amount: 12000 },
  { date: "2026-02-06", category: "ADS", description: "Meta Ads", amount: 10000 },
  { date: "2026-05-30", category: "ADS", description: "Meta Ads", amount: 12000 },
  { date: "2026-06-06", category: "ADS", description: "Meta Ads", amount: 10000 },
  { date: "2026-06-10", category: "ADS", description: "Meta Ads", amount: 10000 },
  { date: "2026-06-12", category: "ADS", description: "Meta Ads", amount: 20000 },
  { date: "2026-06-17", category: "ADS", description: "Meta Ads", amount: 20000 },
  { date: "2026-06-20", category: "ADS", description: "Meta Ads", amount: 20000 },
  { date: "2026-06-22", category: "ADS", description: "Meta Ads", amount: 10000 },
  { date: "2026-06-23", category: "ADS", description: "Meta Ads", amount: 10000 },
  { date: "2026-06-12", category: "STOCK", description: "60pcs shirts (264 USD @ ₦1,400)", amount: 369600 },
  { date: "2026-06-12", category: "STOCK", description: "40pcs caps (161 USD @ ₦1,400)", amount: 225400 },
  { date: "2026-06-12", category: "DELIVERY", description: "Delivery of new stock (340 USD @ ₦1,400)", amount: 476000 },
];

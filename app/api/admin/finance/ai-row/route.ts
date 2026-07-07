import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-guard";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/admin/finance/ai-row
// Body: { kind: "sale" | "expense", text: string }
// Returns a structured DRAFT row (never saved) for the admin to review/edit.
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { kind, text } = await request.json();
    if (!text || (kind !== "sale" && kind !== "expense")) {
      return NextResponse.json(
        { error: "kind ('sale'|'expense') and text are required" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().slice(0, 10);

    const salePrompt = `You convert a plain-English description of an OFFLINE sale for JUSTFITS (a Nigerian car-themed caps brand, currency NGN) into a JSON row.
Today is ${today}. Resolve relative dates (e.g. "yesterday", "last friday") to an ISO date (YYYY-MM-DD). If no date is given, use today.
Return ONLY a JSON object with these fields:
- date: string (YYYY-MM-DD)
- customerName: string
- productText: string (the brand/model, e.g. "Benz", "Benz/Ferrari" if multiple)
- variantText: string | null (colours/variant description if mentioned, else null)
- quantity: number (integer, default 1)
- unitPrice: number (NGN per unit, no currency symbols or commas)
- deliveryFee: number | null (NGN, null if not mentioned)
- deliveryPaidBy: string | null (who paid/handled delivery: "Him"/"Her"/"Me"/"Both"/"Pickup", else null)
- totalCollected: number (total NGN actually received; if not stated, compute quantity*unitPrice + (deliveryFee||0))
- profit: number | null (null if unknown/"none yet")
- paymentStatus: "PAID" | "PARTIAL" | "PENDING" ("PARTIAL" if half/part paid, "PENDING" if unpaid, else "PAID")
- notes: string | null (any extra context, else null)
Interpret Nigerian shorthand like "26k" = 26000. Never invent data that isn't implied.`;

    const expensePrompt = `You convert a plain-English description of a business EXPENSE for JUSTFITS (currency NGN) into a JSON row.
Today is ${today}. Resolve relative dates to an ISO date (YYYY-MM-DD). If no date is given, use today.
Return ONLY a JSON object with these fields:
- date: string (YYYY-MM-DD)
- category: one of "STOCK" | "PACKAGING" | "ADS" | "DELIVERY" | "LOSS" | "RENT" | "SALARIES" | "FEES" | "OTHER" (STOCK = buying caps/shirts/inventory; ADS = Meta/Instagram/marketing; DELIVERY = shipping stock in; LOSS = theft/damage). Choose the best fit, else "OTHER".
- description: string (short summary of what it was)
- amount: number (NGN, no currency symbols or commas)
- notes: string | null
Interpret Nigerian shorthand like "15k" = 15000. Never invent data that isn't implied.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: kind === "sale" ? salePrompt : expensePrompt },
        { role: "user", content: String(text) },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let draft: Record<string, unknown>;
    try {
      draft = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "AI returned an unparseable response" },
        { status: 502 }
      );
    }

    return NextResponse.json({ kind, draft });
  } catch (error) {
    console.error("Finance ai-row error:", error);
    return NextResponse.json(
      { error: "Failed to generate row" },
      { status: 500 }
    );
  }
}

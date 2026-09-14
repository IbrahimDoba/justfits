import { NextRequest, NextResponse } from "next/server";
import { checkAgentAuth } from "@/lib/agent/auth";
import { searchAgentProducts } from "@/lib/agent/catalog";

// GET /api/agent/products?q=<query>&limit=<n>&all=<0|1>
// Dailzero agent tool: search live inventory. Bearer-token protected.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = checkAgentAuth(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const limit = Number(searchParams.get("limit") || 8);
    const includeOutOfStock = searchParams.get("all") === "1";

    const products = await searchAgentProducts(q, {
      limit: Number.isFinite(limit) ? limit : 8,
      includeOutOfStock,
    });

    return NextResponse.json({ count: products.length, products });
  } catch (error) {
    console.error("Agent products search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

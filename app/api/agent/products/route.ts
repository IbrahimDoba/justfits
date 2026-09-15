import { NextRequest, NextResponse } from "next/server";
import { searchAgentProducts } from "@/lib/agent/catalog";
import { inventorySlug } from "@/lib/inventory/slug";

const SITE = "https://justfitsng.com";

// GET /api/agent/products?q=<query>&limit=<n>&all=<0|1>
// Dailzero agent tool: search live inventory. Public, read-only — exposes only
// customer-safe fields (selling price, per-size stock, image; never cost).
//
// Returns a `shopUrl` — a single shareable link to the filtered shop page for
// this query (e.g. /shop/benz). Prefer replying with that ONE link instead of
// pasting a long list of products into the chat. Use `products` when the
// customer asks about a specific item's price or availability.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const limit = Number(searchParams.get("limit") || 8);
    const includeOutOfStock = searchParams.get("all") === "1";

    const products = await searchAgentProducts(q, {
      limit: Number.isFinite(limit) ? limit : 8,
      includeOutOfStock,
    });

    const slug = inventorySlug(q);
    const shopUrl = slug ? `${SITE}/shop/${slug}` : `${SITE}/shop`;

    return NextResponse.json({ count: products.length, shopUrl, products });
  } catch (error) {
    console.error("Agent products search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

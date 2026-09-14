import { NextRequest, NextResponse } from "next/server";
import { getAgentProductBySlug } from "@/lib/agent/catalog";

// GET /api/agent/products/<slug>
// Dailzero agent tool: full details for one product (price, per-size stock,
// image, order link). Public, read-only — no cost price exposed.
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getAgentProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Agent product detail error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}

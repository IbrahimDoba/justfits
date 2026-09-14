import { NextRequest, NextResponse } from "next/server";
import { checkAgentAuth } from "@/lib/agent/auth";
import { getAgentProductBySlug } from "@/lib/agent/catalog";

// GET /api/agent/products/<slug>
// Dailzero agent tool: full details for one product (price, per-size stock,
// image, order link). Bearer-token protected.
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const denied = checkAgentAuth(req);
  if (denied) return denied;

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

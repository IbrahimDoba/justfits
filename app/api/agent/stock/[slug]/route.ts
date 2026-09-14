import { NextRequest, NextResponse } from "next/server";
import { checkAgentAuth } from "@/lib/agent/auth";
import { getAgentProductBySlug } from "@/lib/agent/catalog";

// GET /api/agent/stock/<slug>
// Dailzero agent tool: quick availability check for one product.
// Bearer-token protected.
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
    return NextResponse.json({
      slug: product.slug,
      name: product.name,
      inStock: product.inStock,
      totalStock: product.totalStock,
      sizes: product.sizes,
    });
  } catch (error) {
    console.error("Agent stock check error:", error);
    return NextResponse.json({ error: "Stock check failed" }, { status: 500 });
  }
}

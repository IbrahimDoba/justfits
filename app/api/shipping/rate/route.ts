import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/shipping/rate?state=lagos
export async function GET(request: NextRequest) {
  try {
    const state = request.nextUrl.searchParams.get("state");

    if (!state) {
      return NextResponse.json({ error: "state is required" }, { status: 400 });
    }

    const [zone, settings] = await Promise.all([
      prisma.shippingZone.findUnique({ where: { state } }),
      prisma.storeSetting.findUnique({ where: { id: "default" } }),
    ]);

    const globalFee = settings?.shippingFee ?? 2500;
    const globalThreshold = settings?.freeShippingThreshold ?? 50000;

    if (!zone || !zone.isActive) {
      // Fall back to global settings
      return NextResponse.json({
        price: globalFee,
        freeShippingThreshold: globalThreshold,
        source: "global",
      });
    }

    return NextResponse.json({
      price: zone.price,
      freeShippingThreshold: zone.freeShippingThreshold ?? globalThreshold,
      source: "zone",
    });
  } catch (error) {
    console.error("Get shipping rate error:", error);
    return NextResponse.json({ error: "Failed to get shipping rate" }, { status: 500 });
  }
}

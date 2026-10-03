import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { refreshTracking } from "@/lib/shipping/tracking";

// POST /api/admin/orders/[id]/tracking - Refresh carrier tracking status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      select: { id: true, carrier: true, trackingNumber: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!order.carrier || !order.trackingNumber) {
      return NextResponse.json(
        { error: "Set a carrier and tracking number first" },
        { status: 400 }
      );
    }

    const result = await refreshTracking(order.carrier, order.trackingNumber);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        trackingStatus: result.status,
        trackingUpdatedAt: new Date(),
      },
      select: { trackingStatus: true, trackingUpdatedAt: true },
    });

    return NextResponse.json({
      trackingStatus: updated.trackingStatus,
      trackingUpdatedAt: updated.trackingUpdatedAt?.toISOString(),
    });
  } catch (error) {
    console.error("Refresh tracking error:", error);
    return NextResponse.json(
      { error: "Failed to refresh tracking" },
      { status: 500 }
    );
  }
}

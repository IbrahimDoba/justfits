import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const zones = await prisma.shippingZone.findMany({
      orderBy: { label: "asc" },
    });

    return NextResponse.json({ zones });
  } catch (error) {
    console.error("Get shipping zones error:", error);
    return NextResponse.json({ error: "Failed to fetch shipping zones" }, { status: 500 });
  }
}

// Bulk upsert — receives the full list of zones and syncs them
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { zones } = await request.json() as {
      zones: {
        state: string;
        label: string;
        price: number;
        freeShippingThreshold: number | null;
        isActive: boolean;
      }[];
    };

    if (!Array.isArray(zones)) {
      return NextResponse.json({ error: "zones must be an array" }, { status: 400 });
    }

    await prisma.$transaction(
      zones.map((zone) =>
        prisma.shippingZone.upsert({
          where: { state: zone.state },
          update: {
            price: zone.price,
            freeShippingThreshold: zone.freeShippingThreshold,
            isActive: zone.isActive,
          },
          create: {
            state: zone.state,
            label: zone.label,
            price: zone.price,
            freeShippingThreshold: zone.freeShippingThreshold,
            isActive: zone.isActive,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save shipping zones error:", error);
    return NextResponse.json({ error: "Failed to save shipping zones" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/orders - List all orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status !== "all") {
      where.status = status.toUpperCase();
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          shippingAddress: { select: { city: true, state: true } },
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Get counts by status
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const counts: Record<string, number> = {
      all: total,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    statusCounts.forEach((s) => {
      counts[s.status.toLowerCase()] = s._count.status;
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.orderNumber,
        customer: {
          name: order.user.name || "Unknown",
          email: order.user.email,
        },
        items: order.items.length,
        total: Number(order.total),
        status: order.status.toLowerCase(),
        paymentStatus: "paid",
        createdAt: order.createdAt.toISOString(),
        shippingCity: order.shippingAddress.city,
      })),
      counts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

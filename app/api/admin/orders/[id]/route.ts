import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/orders/[id] - Get a single order
export async function GET(
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
      include: {
        user: { select: { name: true, email: true } },
        shippingAddress: true,
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true } } },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        id: order.orderNumber,
        customer: {
          name: order.user.name || "Unknown",
          email: order.user.email,
          phone: order.shippingAddress.phone,
        },
        shippingAddress: {
          street: order.shippingAddress.street,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
        },
        items: order.items.map((item) => ({
          id: item.id,
          name: `${item.variant.product.name} - ${item.variant.color}`,
          size: item.variant.size,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        subtotal: Number(order.subtotal),
        shipping: Number(order.shippingCost),
        tax: Number(order.tax),
        total: Number(order.total),
        status: order.status.toLowerCase(),
        paymentStatus: order.payment?.status.toLowerCase() || "pending",
        paymentMethod: order.payment?.method || "N/A",
        trackingNumber: null, // Add when schema supports it
        carrierName: null,
        internalNotes: order.notes || "",
        createdAt: order.createdAt.toISOString(),
        statusHistory: [
          {
            status: "pending",
            date: order.createdAt.toISOString(),
            note: "Order placed",
          },
        ],
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/orders/[id] - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber, notes } = body;

    const order = await prisma.order.update({
      where: { orderNumber: id },
      data: {
        status: status?.toUpperCase(),
        notes,
      },
    });

    return NextResponse.json({
      order: {
        id: order.orderNumber,
        status: order.status.toLowerCase(),
      },
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

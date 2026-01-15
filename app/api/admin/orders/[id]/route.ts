import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { awardLoyaltyStamp } from "@/lib/services/loyalty";
import { sendOrderStatusEmail } from "@/lib/services/email";

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
              include: { product: { select: { name: true, images: true } } },
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
          image: item.variant.product.images[0]?.url || null,
        })),
        subtotal: Number(order.subtotal),
        shipping: Number(order.shippingCost),
        tax: Number(order.tax),
        total: Number(order.total),
        status: order.status.toLowerCase(),
        paymentStatus: order.payment?.status.toLowerCase() || "pending",
        paymentMethod: order.payment?.method || "N/A",
        receiptUrl: order.payment?.receiptUrl || null,
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
    const { status, notes } = body;

    const newStatus = status?.toUpperCase();

    // Get current order with items and user to check status and reduce stock
    const currentOrder = await prisma.order.findUnique({
      where: { orderNumber: id },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if status is changing to CONFIRMED from a non-confirmed status
    const isBeingConfirmed =
      newStatus === "CONFIRMED" && currentOrder.status !== "CONFIRMED";

    // Use transaction to update order and reduce stock atomically
    const order = await prisma.$transaction(async (tx) => {
      // If order is being confirmed, reduce stock for each item
      if (isBeingConfirmed) {
        for (const item of currentOrder.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Update the order status
      return tx.order.update({
        where: { orderNumber: id },
        data: {
          status: newStatus,
          notes,
        },
      });
    });

    // Award loyalty stamp when order is confirmed (outside transaction for simplicity)
    if (isBeingConfirmed) {
      await awardLoyaltyStamp(currentOrder.userId);
    }

    // Send status update email for important status changes
    const emailStatuses = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (
      emailStatuses.includes(newStatus) &&
      currentOrder.status !== newStatus &&
      currentOrder.user.email
    ) {
      sendOrderStatusEmail({
        orderNumber: order.orderNumber,
        customerName: currentOrder.user.name || "Customer",
        customerEmail: currentOrder.user.email,
        status: newStatus,
      }).catch((err) => console.error("Failed to send status email:", err));
    }

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

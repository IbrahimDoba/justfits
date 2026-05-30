import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/orders/lookup?orderNumber=JF-1234&email=customer@email.com
// Public endpoint for AI agent / customer support order lookups
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber")?.trim();
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!orderNumber || !email) {
    return NextResponse.json(
      { error: "orderNumber and email are required" },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        OR: [
          { user: { email } },
          { guestEmail: email },
        ],
      },
      select: {
        orderNumber: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        subtotal: true,
        shippingCost: true,
        tax: true,
        total: true,
        notes: true,
        shippingAddress: {
          select: {
            firstName: true,
            lastName: true,
            street: true,
            city: true,
            state: true,
            country: true,
          },
        },
        items: {
          select: {
            quantity: true,
            price: true,
            variant: {
              select: {
                name: true,
                size: true,
                color: true,
                product: {
                  select: { name: true, slug: true },
                },
              },
            },
          },
        },
        payment: {
          select: {
            status: true,
            method: true,
            paidAt: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Please check your order number and email." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      placedAt: order.createdAt,
      lastUpdated: order.updatedAt,
      payment: order.payment
        ? {
            status: order.payment.status,
            method: order.payment.method,
            paidAt: order.payment.paidAt,
          }
        : null,
      items: order.items.map((item) => ({
        product: item.variant.product.name,
        variant: item.variant.name,
        size: item.variant.size,
        color: item.variant.color,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      totals: {
        subtotal: Number(order.subtotal),
        shipping: Number(order.shippingCost),
        tax: Number(order.tax),
        total: Number(order.total),
      },
      shippingAddress: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        country: order.shippingAddress.country,
      },
      notes: order.notes,
    });
  } catch (error) {
    console.error("Order lookup error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

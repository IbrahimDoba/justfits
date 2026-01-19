import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/services/email";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to verify payment" },
        { status: 401 }
      );
    }

    // Get reference from query params
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Verify transaction with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status) {
      console.error("Paystack verification error:", data);
      return NextResponse.json(
        { error: data.message || "Failed to verify payment" },
        { status: 400 }
      );
    }

    const transaction = data.data;

    // Check if payment was successful
    if (transaction.status !== "success") {
      return NextResponse.json({
        success: false,
        status: transaction.status,
        message: transaction.gateway_response,
      });
    }

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: { transactionId: reference },
      include: {
        order: {
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
            shippingAddress: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // Verify amount matches
    const amountInNaira = transaction.amount / 100;
    const paymentAmount = Number(payment.amount);
    if (Math.abs(amountInNaira - paymentAmount) > 0.01) {
      return NextResponse.json(
        { error: "Payment amount mismatch" },
        { status: 400 }
      );
    }

    // Update payment if not already completed (webhook may have already done this)
    let shouldSendEmail = false;
    if (payment.status !== "COMPLETED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          paidAt: new Date(transaction.paid_at),
          paymentGateway: "PAYSTACK",
          metadata: {
            channel: transaction.channel,
            customer_code: transaction.customer?.customer_code,
          },
        },
      });

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PROCESSING",
        },
      });

      // Mark that we should send email since this is a new completion
      shouldSendEmail = true;
    }

    // Send confirmation emails if this was a new payment completion
    if (shouldSendEmail && payment.order && payment.order.shippingAddress) {
      const order = payment.order;
      const address = order.shippingAddress;

      // Send customer confirmation email
      sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: `${address.firstName} ${address.lastName}`,
        customerEmail: transaction.customer?.email || address.phone,
        items: order.items.map((item) => ({
          name: item.variant.product.name,
          size: item.variant.size || "One Size",
          quantity: item.quantity,
          price: Number(item.price),
        })),
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        total: Number(order.total),
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode || "",
        },
      }).catch((err) => console.error("Failed to send confirmation email:", err));

      // Send admin notification email
      sendAdminOrderNotification({
        orderNumber: order.orderNumber,
        customerName: `${address.firstName} ${address.lastName}`,
        customerEmail: transaction.customer?.email || address.phone,
        customerPhone: address.phone,
        items: order.items.map((item) => ({
          name: item.variant.product.name,
          size: item.variant.size || "One Size",
          quantity: item.quantity,
          price: Number(item.price),
        })),
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        total: Number(order.total),
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode || "",
        },
      }).catch((err) => console.error("Failed to send admin notification:", err));
    }

    return NextResponse.json({
      success: true,
      status: "success",
      message: "Payment verified successfully",
      data: {
        reference: transaction.reference,
        amount: amountInNaira,
        paid_at: transaction.paid_at,
        channel: transaction.channel,
        orderNumber: payment.order.orderNumber,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment. Please try again." },
      { status: 500 }
    );
  }
}

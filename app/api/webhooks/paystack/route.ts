import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import prisma from "@/lib/db/prisma";
import { sendOrderConfirmationEmail } from "@/lib/services/email";

export async function POST(request: Request) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("x-paystack-signature");

    // Verify signature
    if (!signature) {
      console.error("No signature provided");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 401 }
      );
    }

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse the event
    const event = JSON.parse(body);

    console.log("Webhook event received:", event.event);

    // Handle different event types
    switch (event.event) {
      case "charge.success":
        await handleSuccessfulPayment(event.data);
        break;

      case "charge.failed":
        await handleFailedPayment(event.data);
        break;

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    const { reference, amount, customer, metadata, paid_at, channel } = data;

    console.log("Processing successful payment:", reference);

    // Find the payment record by reference
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
      console.error("Payment not found for reference:", reference);
      return;
    }

    // Verify amount matches
    const amountInNaira = amount / 100;
    if (Math.abs(amountInNaira - payment.amount) > 0.01) {
      console.error(
        `Amount mismatch: expected ${payment.amount}, got ${amountInNaira}`
      );
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        paidAt: new Date(paid_at),
        paymentGateway: "PAYSTACK",
        metadata: {
          channel,
          customer_code: customer?.customer_code,
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

    // Send confirmation email
    if (payment.order && payment.order.shippingAddress) {
      const order = payment.order;
      const address = order.shippingAddress;

      await sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: `${address.firstName} ${address.lastName}`,
        customerEmail: customer.email,
        items: order.items.map((item) => ({
          name: item.variant.product.name,
          size: item.variant.size || "One Size",
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        total: order.total,
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode || "",
        },
      }).catch((err) =>
        console.error("Failed to send confirmation email:", err)
      );
    }

    console.log("Payment processed successfully:", reference);
  } catch (error) {
    console.error("Error handling successful payment:", error);
    throw error;
  }
}

async function handleFailedPayment(data: any) {
  try {
    const { reference } = data;

    console.log("Processing failed payment:", reference);

    // Find and update payment record
    const payment = await prisma.payment.findFirst({
      where: { transactionId: reference },
    });

    if (!payment) {
      console.error("Payment not found for reference:", reference);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
      },
    });

    console.log("Failed payment recorded:", reference);
  } catch (error) {
    console.error("Error handling failed payment:", error);
    throw error;
  }
}

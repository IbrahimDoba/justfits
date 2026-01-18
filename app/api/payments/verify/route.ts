import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";

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
        order: true,
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
    if (Math.abs(amountInNaira - payment.amount) > 0.01) {
      return NextResponse.json(
        { error: "Payment amount mismatch" },
        { status: 400 }
      );
    }

    // Update payment if not already completed (webhook may have already done this)
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

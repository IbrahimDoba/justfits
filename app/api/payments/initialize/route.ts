import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to make a payment" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      email,
      amount, // Amount in Naira (will be converted to kobo)
      metadata,
      callback_url,
    } = body;

    // Validate required fields
    if (!email || !amount) {
      return NextResponse.json(
        { error: "Email and amount are required" },
        { status: 400 }
      );
    }

    // Convert amount to kobo (Paystack uses kobo for NGN)
    const amountInKobo = Math.round(amount * 100);

    // Initialize transaction with Paystack
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountInKobo,
          currency: "NGN",
          callback_url: callback_url || `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/verify`,
          metadata: {
            userId: session.user.id,
            ...metadata,
          },
          channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
        }),
      }
    );

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status) {
      console.error("Paystack initialization error:", data);
      return NextResponse.json(
        { error: data.message || "Failed to initialize payment" },
        { status: 400 }
      );
    }

    // Return the access code and reference for frontend
    return NextResponse.json({
      success: true,
      data: {
        access_code: data.data.access_code,
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
      },
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment. Please try again." },
      { status: 500 }
    );
  }
}

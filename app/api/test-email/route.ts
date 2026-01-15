import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail, sendOrderStatusEmail, sendAdminOrderNotification } from "@/lib/services/email";

// DELETE THIS FILE AFTER TESTING
// Test endpoint: GET /api/test-email?email=your@email.com&type=confirmation|status|admin

export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const type = searchParams.get("type") || "confirmation";

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter required. Use ?email=your@email.com" },
      { status: 400 }
    );
  }

  try {
    if (type === "status") {
      const result = await sendOrderStatusEmail({
        orderNumber: "JF-TEST-123456",
        customerName: "Test Customer",
        customerEmail: email,
        status: "SHIPPED",
        trackingNumber: "TRACK123456789",
      });

      return NextResponse.json({
        message: "Status email sent",
        result,
      });
    }

    if (type === "admin") {
      const result = await sendAdminOrderNotification({
        orderNumber: "JF-TEST-123456",
        customerName: "Test Customer",
        customerEmail: "customer@example.com",
        customerPhone: "+234 801 234 5678",
        items: [
          { name: "Classic White T-Shirt", size: "M", quantity: 2, price: 15000 },
          { name: "Black Joggers", size: "L", quantity: 1, price: 25000 },
        ],
        subtotal: 55000,
        shippingCost: 2500,
        discount: 10,
        total: 51750,
        shippingAddress: {
          street: "123 Test Street",
          city: "Lagos",
          state: "Lagos",
          postalCode: "100001",
        },
      });

      return NextResponse.json({
        message: `Admin notification email sent to ${process.env.ADMIN_EMAIL || "admin@justfits.com"}`,
        result,
      });
    }

    // Default: confirmation email
    const result = await sendOrderConfirmationEmail({
      orderNumber: "JF-TEST-123456",
      customerName: "Test Customer",
      customerEmail: email,
      items: [
        { name: "Classic White T-Shirt", size: "M", quantity: 2, price: 15000 },
        { name: "Black Joggers", size: "L", quantity: 1, price: 25000 },
      ],
      subtotal: 55000,
      shippingCost: 2500,
      discount: 10,
      total: 51750,
      shippingAddress: {
        street: "123 Test Street",
        city: "Lagos",
        state: "Lagos",
        postalCode: "100001",
      },
    });

    return NextResponse.json({
      message: "Confirmation email sent",
      result,
    });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: String(error) },
      { status: 500 }
    );
  }
}

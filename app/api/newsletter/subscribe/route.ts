import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check if audience ID is configured
    if (!AUDIENCE_ID) {
      console.error("RESEND_AUDIENCE_ID is not configured");
      return NextResponse.json(
        { error: "Newsletter subscription is not configured" },
        { status: 500 }
      );
    }

    // Add contact to Resend audience
    const { data, error } = await resend.contacts.create({
      email: email.toLowerCase().trim(),
      audienceId: AUDIENCE_ID,
      unsubscribed: false,
    });

    if (error) {
      // Check if contact already exists
      if (error.message?.includes("already exists") || error.message?.includes("Contact already")) {
        return NextResponse.json(
          { error: "This email is already subscribed" },
          { status: 409 }
        );
      }

      console.error("Failed to add subscriber to Resend:", error);
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    console.log("Newsletter subscriber added:", data?.id);
    return NextResponse.json(
      { success: true, message: "Successfully subscribed to newsletter!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

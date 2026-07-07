import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import prisma from "@/lib/db/prisma";
import { sendPasswordResetEmail } from "@/lib/services/email";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

function baseUrl() {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://justfitsng.com"
  ).replace(/\/$/, "");
}

// POST /api/auth/forgot-password  { email }
// Always responds with success to avoid leaking which emails have accounts.
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalized = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true, email: true, name: true, password: true },
    });

    // Only send a reset link to accounts that use a password (not Google-only).
    if (user && user.password) {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + RESET_TTL_MS);

      // Clear any previous tokens for this email, then store the new one.
      await prisma.verificationToken.deleteMany({
        where: { identifier: normalized },
      });
      await prisma.verificationToken.create({
        data: { identifier: normalized, token, expires },
      });

      const resetUrl = `${baseUrl()}/auth/reset-password?token=${token}&email=${encodeURIComponent(
        normalized
      )}`;

      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl,
      });
    }

    return NextResponse.json({
      message:
        "If an account with that email exists, we've sent a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

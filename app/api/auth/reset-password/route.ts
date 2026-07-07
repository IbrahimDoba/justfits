import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/db/prisma";

// POST /api/auth/reset-password  { email, token, password }
export async function POST(request: Request) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalized = String(email).trim().toLowerCase();

    const record = await prisma.verificationToken.findUnique({
      where: { token: String(token) },
    });

    if (
      !record ||
      record.identifier !== normalized ||
      record.expires < new Date()
    ) {
      // Clean up an expired/mismatched token if it exists.
      if (record) {
        await prisma.verificationToken.deleteMany({
          where: { token: record.token },
        });
      }
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier: normalized },
      }),
    ]);

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";

// POST /api/rewards/validate - Validate a reward code
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const reward = await prisma.loyaltyReward.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!reward) {
      return NextResponse.json(
        { error: "Invalid reward code" },
        { status: 404 }
      );
    }

    // Check if reward belongs to user
    if (reward.userId !== session.user.id) {
      return NextResponse.json(
        { error: "This reward code doesn't belong to you" },
        { status: 403 }
      );
    }

    // Check if already redeemed
    if (reward.isRedeemed) {
      return NextResponse.json(
        { error: "This reward has already been used" },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date(reward.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This reward has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      reward: {
        id: reward.id,
        code: reward.code,
        discountPercent: reward.discountPercent,
        expiresAt: reward.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error validating reward:", error);
    return NextResponse.json(
      { error: "Failed to validate reward" },
      { status: 500 }
    );
  }
}

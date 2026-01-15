import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { STAMPS_FOR_REWARD } from "@/lib/services/loyalty";

// GET /api/user/loyalty - Get user's loyalty card and rewards
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create loyalty card
    let loyaltyCard = await prisma.loyaltyCard.findUnique({
      where: { userId: session.user.id },
    });

    if (!loyaltyCard) {
      loyaltyCard = await prisma.loyaltyCard.create({
        data: {
          userId: session.user.id,
          stamps: 0,
          totalStampsEarned: 0,
          totalRewardsEarned: 0,
        },
      });
    }

    // Get user's rewards
    const rewards = await prisma.loyaltyReward.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const availableRewards = rewards.filter(
      (r) => !r.isRedeemed && new Date(r.expiresAt) > new Date()
    );
    const usedRewards = rewards.filter((r) => r.isRedeemed);
    const expiredRewards = rewards.filter(
      (r) => !r.isRedeemed && new Date(r.expiresAt) <= new Date()
    );

    return NextResponse.json({
      loyaltyCard: {
        stamps: loyaltyCard.stamps,
        stampsNeeded: STAMPS_FOR_REWARD,
        stampsRemaining: STAMPS_FOR_REWARD - loyaltyCard.stamps,
        totalStampsEarned: loyaltyCard.totalStampsEarned,
        totalRewardsEarned: loyaltyCard.totalRewardsEarned,
        progress: Math.round((loyaltyCard.stamps / STAMPS_FOR_REWARD) * 100),
      },
      rewards: {
        available: availableRewards.map((r) => ({
          id: r.id,
          code: r.code,
          discountPercent: r.discountPercent,
          expiresAt: r.expiresAt.toISOString(),
        })),
        used: usedRewards.map((r) => ({
          id: r.id,
          code: r.code,
          discountPercent: r.discountPercent,
          redeemedAt: r.redeemedAt?.toISOString(),
        })),
        expiredCount: expiredRewards.length,
      },
    });
  } catch (error) {
    console.error("Error fetching loyalty data:", error);
    return NextResponse.json(
      { error: "Failed to fetch loyalty data" },
      { status: 500 }
    );
  }
}

import prisma from "@/lib/db/prisma";

const STAMPS_FOR_REWARD = 8;
const REWARD_DISCOUNT_PERCENT = 30;
const REWARD_EXPIRY_DAYS = 90;

function generateRewardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "JF-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function awardLoyaltyStamp(userId: string) {
  try {
    // Get or create loyalty card
    let loyaltyCard = await prisma.loyaltyCard.findUnique({
      where: { userId },
    });

    if (!loyaltyCard) {
      loyaltyCard = await prisma.loyaltyCard.create({
        data: {
          userId,
          stamps: 0,
          totalStampsEarned: 0,
          totalRewardsEarned: 0,
        },
      });
    }

    // Add stamp
    const newStamps = loyaltyCard.stamps + 1;
    const newTotalStamps = loyaltyCard.totalStampsEarned + 1;

    // Check if reward should be generated
    if (newStamps >= STAMPS_FOR_REWARD) {
      // Generate reward and reset stamps
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + REWARD_EXPIRY_DAYS);

      // Use transaction to ensure atomicity
      await prisma.$transaction([
        prisma.loyaltyReward.create({
          data: {
            userId,
            code: generateRewardCode(),
            discountPercent: REWARD_DISCOUNT_PERCENT,
            expiresAt,
          },
        }),
        prisma.loyaltyCard.update({
          where: { userId },
          data: {
            stamps: 0, // Reset stamps
            totalStampsEarned: newTotalStamps,
            totalRewardsEarned: { increment: 1 },
          },
        }),
      ]);

      return { stampsAwarded: 1, rewardUnlocked: true };
    } else {
      // Just add stamp
      await prisma.loyaltyCard.update({
        where: { userId },
        data: {
          stamps: newStamps,
          totalStampsEarned: newTotalStamps,
        },
      });

      return { stampsAwarded: 1, rewardUnlocked: false };
    }
  } catch (error) {
    console.error("Error awarding loyalty stamp:", error);
    return { stampsAwarded: 0, rewardUnlocked: false, error };
  }
}

export { STAMPS_FOR_REWARD, REWARD_DISCOUNT_PERCENT, REWARD_EXPIRY_DAYS };

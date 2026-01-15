import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [ordersCount, wishlistCount, reviewsCount] = await Promise.all([
      prisma.order.count({
        where: { userId: session.user.id },
      }),
      prisma.wishlistItem.count({
        where: { userId: session.user.id },
      }),
      prisma.review.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      orders: ordersCount,
      wishlist: wishlistCount,
      reviews: reviewsCount,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}

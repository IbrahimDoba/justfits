import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get period from query params (default: monthly)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly";

    // Get counts and statistics
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      totalProducts,
      lowStockProducts,
      totalUsers,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.product.count(),
      prisma.productVariant.count({
        where: { stockQuantity: { lte: 5 } },
      }),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { variant: true } },
        },
      }),
    ]);

    // Calculate revenue (sum of all completed orders)
    const revenueResult = await prisma.order.aggregate({
      where: { status: "DELIVERED" },
      _sum: { total: true },
    });
    const totalRevenue = revenueResult._sum.total || 0;

    // Aggregated Revenue for Chart based on period
    let startDate = new Date();
    let revenueChart: Array<{ name: string; value: number }> = [];

    if (period === "daily") {
      // Last 7 days
      startDate.setDate(startDate.getDate() - 7);

      const chartOrders = await prisma.order.findMany({
        where: {
          status: "DELIVERED",
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
          total: true,
        },
        orderBy: { createdAt: "asc" },
      });

      // Group by day
      const dailyRevenue = chartOrders.reduce((acc, order) => {
        const day = order.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        acc[day] = (acc[day] || 0) + Number(order.total);
        return acc;
      }, {} as Record<string, number>);

      // Fill in missing days
      const allDays: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayKey = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        allDays[dayKey] = dailyRevenue[dayKey] || 0;
      }

      revenueChart = Object.entries(allDays).map(([name, value]) => ({
        name,
        value,
      }));
    } else if (period === "weekly") {
      // Last 8 weeks
      startDate.setDate(startDate.getDate() - 56); // 8 weeks

      const chartOrders = await prisma.order.findMany({
        where: {
          status: "DELIVERED",
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
          total: true,
        },
        orderBy: { createdAt: "asc" },
      });

      // Group by week
      const weeklyRevenue: Record<string, number> = {};
      chartOrders.forEach((order) => {
        const weekStart = new Date(order.createdAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        weeklyRevenue[weekKey] = (weeklyRevenue[weekKey] || 0) + Number(order.total);
      });

      // Fill in missing weeks
      const allWeeks: Record<string, number> = {};
      for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7) - date.getDay());
        const weekKey = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        allWeeks[weekKey] = weeklyRevenue[weekKey] || 0;
      }

      revenueChart = Object.entries(allWeeks).map(([name, value]) => ({
        name,
        value,
      }));
    } else {
      // Monthly (default) - Last 6 months
      startDate.setMonth(startDate.getMonth() - 6);

      const chartOrders = await prisma.order.findMany({
        where: {
          status: "DELIVERED",
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
          total: true,
        },
        orderBy: { createdAt: "asc" },
      });

      // Group by month
      const monthlyRevenue = chartOrders.reduce((acc, order) => {
        const month = order.createdAt.toLocaleString("default", {
          month: "short",
        });
        acc[month] = (acc[month] || 0) + Number(order.total);
        return acc;
      }, {} as Record<string, number>);

      revenueChart = Object.entries(monthlyRevenue).map(
        ([name, value]) => ({
          name,
          value,
        })
      );
    }

    // Get low stock products
    const lowStockItems = await prisma.productVariant.findMany({
      where: { stockQuantity: { lte: 5 } },
      take: 5,
      include: { product: { select: { name: true } } },
    });

    return NextResponse.json({
      stats: {
        totalRevenue: Number(totalRevenue),
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        totalProducts,
        lowStockProducts,
        totalUsers,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.user?.name || order.user?.email || order.guestEmail || "Guest",
        items: order.items.length,
        total: Number(order.total),
        status: order.status.toLowerCase(),
        createdAt: order.createdAt.toISOString(),
      })),
      lowStockItems: lowStockItems.map((item) => ({
        name: `${item.product.name} - ${item.color} ${item.size}`,
        stock: item.stockQuantity,
        threshold: item.lowStockThreshold,
      })),
      revenueChart,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

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

    // Aggregated Revenue for Chart (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const chartOrders = await prisma.order.findMany({
      where: {
        status: "DELIVERED",
        createdAt: { gte: sixMonthsAgo },
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

    const revenueChart = Object.entries(monthlyRevenue).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

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
        customer: order.user.name || order.user.email,
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

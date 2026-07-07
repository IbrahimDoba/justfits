import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import type { Prisma } from "@prisma/client";

const PAYMENT_STATUSES = ["PAID", "PARTIAL", "PENDING"] as const;

// GET /api/admin/finance/sales - list offline sales (optional filters)
export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Prisma.SaleWhereInput = {};
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { productText: { contains: search, mode: "insensitive" } },
        { variantText: { contains: search, mode: "insensitive" } },
      ];
    }
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const sales = await prisma.sale.findMany({
      where,
      orderBy: { date: "desc" },
      include: { product: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      sales: sales.map((s) => ({
        ...s,
        unitPrice: Number(s.unitPrice),
        deliveryFee: s.deliveryFee === null ? null : Number(s.deliveryFee),
        totalCollected: Number(s.totalCollected),
        profit: s.profit === null ? null : Number(s.profit),
      })),
    });
  } catch (error) {
    console.error("Finance sales GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

// POST /api/admin/finance/sales - create an offline sale
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const customerName = String(body.customerName || "").trim();
    const productText = String(body.productText || "").trim();
    if (!customerName || !productText) {
      return NextResponse.json(
        { error: "customerName and productText are required" },
        { status: 400 }
      );
    }

    const quantity = Math.max(1, parseInt(body.quantity, 10) || 1);
    const unitPrice = Number(body.unitPrice) || 0;
    const deliveryFee =
      body.deliveryFee === null ||
      body.deliveryFee === undefined ||
      body.deliveryFee === ""
        ? null
        : Number(body.deliveryFee);
    const totalCollected =
      body.totalCollected === null ||
      body.totalCollected === undefined ||
      body.totalCollected === ""
        ? unitPrice * quantity + (deliveryFee || 0)
        : Number(body.totalCollected);
    const profit =
      body.profit === null || body.profit === undefined || body.profit === ""
        ? null
        : Number(body.profit);
    const paymentStatus = PAYMENT_STATUSES.includes(body.paymentStatus)
      ? body.paymentStatus
      : "PAID";

    const deductStock = Boolean(body.deductStock) && Boolean(body.productId);

    const sale = await prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          date: body.date ? new Date(body.date) : new Date(),
          customerName,
          productText,
          variantText: body.variantText?.trim() || null,
          quantity,
          unitPrice,
          deliveryFee,
          deliveryPaidBy: body.deliveryPaidBy?.trim() || null,
          totalCollected,
          profit,
          paymentStatus,
          notes: body.notes?.trim() || null,
          productId: body.productId || null,
          deductedStock: deductStock,
        },
      });

      // Optional inventory deduction for NEW sales linked to a catalog variant
      if (deductStock && body.variantId) {
        await tx.productVariant.update({
          where: { id: body.variantId },
          data: { stockQuantity: { decrement: quantity } },
        });
      }

      return created;
    });

    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    console.error("Finance sales POST error:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}

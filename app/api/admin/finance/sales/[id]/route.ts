import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import type { Prisma } from "@prisma/client";

const PAYMENT_STATUSES = ["PAID", "PARTIAL", "PENDING"] as const;

// GET /api/admin/finance/sales/[id] - single sale (for the invoice view)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }
    return NextResponse.json({
      sale: {
        ...sale,
        unitPrice: Number(sale.unitPrice),
        deliveryFee: sale.deliveryFee === null ? null : Number(sale.deliveryFee),
        totalCollected: Number(sale.totalCollected),
        profit: sale.profit === null ? null : Number(sale.profit),
        items: sale.items.map((it) => ({ ...it, unitPrice: Number(it.unitPrice) })),
      },
    });
  } catch (error) {
    console.error("Finance sale GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sale" }, { status: 500 });
  }
}

// PATCH /api/admin/finance/sales/[id] - update a sale
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const data: Prisma.SaleUpdateInput = {};
    if (body.date !== undefined) data.date = new Date(body.date);
    if (body.customerName !== undefined)
      data.customerName = String(body.customerName).trim();
    if (body.customerPhone !== undefined)
      data.customerPhone = String(body.customerPhone).trim() || null;
    if (body.productText !== undefined)
      data.productText = String(body.productText).trim();
    if (body.variantText !== undefined)
      data.variantText = body.variantText?.trim() || null;
    if (body.quantity !== undefined)
      data.quantity = Math.max(1, parseInt(body.quantity, 10) || 1);
    if (body.unitPrice !== undefined) data.unitPrice = Number(body.unitPrice);
    if (body.deliveryFee !== undefined)
      data.deliveryFee =
        body.deliveryFee === null || body.deliveryFee === ""
          ? null
          : Number(body.deliveryFee);
    if (body.deliveryPaidBy !== undefined)
      data.deliveryPaidBy = body.deliveryPaidBy?.trim() || null;
    if (body.location !== undefined)
      data.location = body.location?.trim() || null;
    if (body.totalCollected !== undefined)
      data.totalCollected = Number(body.totalCollected);
    if (body.profit !== undefined)
      data.profit =
        body.profit === null || body.profit === "" ? null : Number(body.profit);
    if (body.paymentStatus !== undefined && PAYMENT_STATUSES.includes(body.paymentStatus))
      data.paymentStatus = body.paymentStatus;
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

    const sale = await prisma.sale.update({ where: { id }, data });
    return NextResponse.json({ sale });
  } catch (error) {
    console.error("Finance sales PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update sale" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/finance/sales/[id] - delete a sale
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.sale.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Finance sales DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    );
  }
}

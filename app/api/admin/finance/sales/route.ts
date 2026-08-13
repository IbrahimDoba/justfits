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
        { customerPhone: { contains: search, mode: "insensitive" } },
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
      include: {
        product: { select: { id: true, name: true } },
        items: true,
      },
    });

    return NextResponse.json({
      sales: sales.map((s) => ({
        ...s,
        unitPrice: Number(s.unitPrice),
        deliveryFee: s.deliveryFee === null ? null : Number(s.deliveryFee),
        totalCollected: Number(s.totalCollected),
        profit: s.profit === null ? null : Number(s.profit),
        items: s.items.map((it) => ({
          ...it,
          unitPrice: Number(it.unitPrice),
        })),
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
    const customerPhone = String(body.customerPhone || "").trim() || null;

    // Parse optional itemised line items (inventory picks).
    type LineItem = {
      inventoryItemId: string | null;
      name: string;
      size: string | null;
      quantity: number;
      unitPrice: number;
    };
    const rawItems: unknown[] = Array.isArray(body.items) ? body.items : [];
    const items: LineItem[] = rawItems
      .map((raw) => {
        const it = raw as Record<string, unknown>;
        return {
          inventoryItemId: it.inventoryItemId
            ? String(it.inventoryItemId)
            : null,
          name: String(it.name || "").trim(),
          size: it.size ? String(it.size).trim() : null,
          quantity: Math.max(1, parseInt(String(it.quantity), 10) || 1),
          unitPrice: Number(it.unitPrice) || 0,
        };
      })
      .filter((it) => it.name);

    // productText is derived from items when itemised, else required manually.
    const productText =
      String(body.productText || "").trim() ||
      items.map((i) => (i.size ? `${i.name} (${i.size})` : i.name)).join(", ");

    if (!customerName || !productText) {
      return NextResponse.json(
        { error: "customerName and at least one item (or product) are required" },
        { status: 400 }
      );
    }

    const itemsSubtotal = items.reduce(
      (s, i) => s + i.quantity * i.unitPrice,
      0
    );
    const itemsQty = items.reduce((s, i) => s + i.quantity, 0);

    const quantity = items.length
      ? itemsQty
      : Math.max(1, parseInt(body.quantity, 10) || 1);
    const unitPrice = items.length
      ? items.length === 1
        ? items[0].unitPrice
        : 0
      : Number(body.unitPrice) || 0;
    const deliveryFee =
      body.deliveryFee === null ||
      body.deliveryFee === undefined ||
      body.deliveryFee === ""
        ? null
        : Number(body.deliveryFee);
    const baseSubtotal = items.length ? itemsSubtotal : unitPrice * quantity;
    const totalCollected =
      body.totalCollected === null ||
      body.totalCollected === undefined ||
      body.totalCollected === ""
        ? baseSubtotal + (deliveryFee || 0)
        : Number(body.totalCollected);
    // Real profit = collected − cost of goods − delivery paid out.
    // Auto-calculated when not provided, if every line item is linked to an
    // inventory record with a known costPrice. (If the customer paid delivery
    // it is inside totalCollected, so subtracting the fee is correct either way.)
    let profit =
      body.profit === null || body.profit === undefined || body.profit === ""
        ? null
        : Number(body.profit);
    if (profit === null && items.length > 0) {
      const ids = items
        .map((i) => i.inventoryItemId)
        .filter((id): id is string => !!id);
      if (ids.length === items.length) {
        const invItems = await prisma.inventoryItem.findMany({
          where: { id: { in: ids } },
          select: { id: true, costPrice: true },
        });
        const costById = new Map(
          invItems.map((i) => [i.id, i.costPrice === null ? null : Number(i.costPrice)])
        );
        const costs = items.map(
          (i) => [i.quantity, costById.get(i.inventoryItemId!)] as const
        );
        if (costs.every(([, c]) => c !== null && c !== undefined)) {
          const cogs = costs.reduce((s, [q, c]) => s + q * (c as number), 0);
          profit = totalCollected - cogs - (deliveryFee || 0);
        }
      }
    }
    const paymentStatus = PAYMENT_STATUSES.includes(body.paymentStatus)
      ? body.paymentStatus
      : "PAID";

    // Deduct inventory when items are linked (default on), unless disabled.
    const deductStock = body.deductStock !== false && items.length > 0;

    const sale = await prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          date: body.date ? new Date(body.date) : new Date(),
          customerName,
          customerPhone,
          productText,
          variantText: body.variantText?.trim() || null,
          quantity,
          unitPrice,
          deliveryFee,
          deliveryPaidBy: body.deliveryPaidBy?.trim() || null,
          location: body.location?.trim() || null,
          totalCollected,
          profit,
          paymentStatus,
          notes: body.notes?.trim() || null,
          productId: body.productId || null,
          deductedStock: deductStock,
          items: items.length
            ? {
                create: items.map((i) => ({
                  inventoryItemId: i.inventoryItemId,
                  name: i.name,
                  size: i.size,
                  quantity: i.quantity,
                  unitPrice: i.unitPrice,
                })),
              }
            : undefined,
        },
        include: { items: true },
      });

      // Atomic, clamp-at-0 inventory deduction for each linked item.
      if (deductStock) {
        for (const i of items) {
          if (!i.inventoryItemId) continue;
          const inv = await tx.inventoryItem.findUnique({
            where: { id: i.inventoryItemId },
            select: { quantity: true },
          });
          if (!inv) continue;
          await tx.inventoryItem.update({
            where: { id: i.inventoryItemId },
            data: { quantity: Math.max(0, inv.quantity - i.quantity) },
          });
        }
      }

      // Legacy path: deduct a linked catalog variant if provided.
      if (body.deductStock && body.variantId) {
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

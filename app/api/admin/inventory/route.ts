import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import type { Prisma } from "@prisma/client";

// GET /api/admin/inventory - list inventory items
export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    const where: Prisma.InventoryItemWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { size: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({
      items: items.map((i) => ({
        ...i,
        costPrice: i.costPrice === null ? null : Number(i.costPrice),
        sellingPrice: i.sellingPrice === null ? null : Number(i.sellingPrice),
      })),
    });
  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// POST /api/admin/inventory - create an inventory item
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const num = (v: unknown) =>
      v === null || v === undefined || v === "" ? null : Number(v);
    const CATEGORIES = ["CAP", "SHIRT", "OTHER"] as const;
    const guessCategory = (n: string) =>
      /shirt|polo|tee|jersey/i.test(n) ? "SHIRT" : /cap|hat/i.test(n) ? "CAP" : "OTHER";
    const category = CATEGORIES.includes(body.category)
      ? body.category
      : guessCategory(name);

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        brand: body.brand?.trim() || null,
        size: body.size?.trim() || null,
        sku: body.sku?.trim() || null,
        costPrice: num(body.costPrice),
        sellingPrice: num(body.sellingPrice),
        quantity: Math.max(0, parseInt(body.quantity, 10) || 0),
        notes: body.notes?.trim() || null,
        isActive: body.isActive === undefined ? true : Boolean(body.isActive),
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Inventory POST error:", error);
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}

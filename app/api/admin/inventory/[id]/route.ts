import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import type { Prisma } from "@prisma/client";

// PATCH /api/admin/inventory/[id]
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
    const num = (v: unknown) =>
      v === null || v === "" ? null : Number(v);

    const data: Prisma.InventoryItemUpdateInput = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.brand !== undefined) data.brand = body.brand?.trim() || null;
    if (body.size !== undefined) data.size = body.size?.trim() || null;
    if (body.sku !== undefined) data.sku = body.sku?.trim() || null;
    if (body.costPrice !== undefined) data.costPrice = num(body.costPrice);
    if (body.sellingPrice !== undefined)
      data.sellingPrice = num(body.sellingPrice);
    if (body.quantity !== undefined)
      data.quantity = Math.max(0, parseInt(body.quantity, 10) || 0);
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const item = await prisma.inventoryItem.update({ where: { id }, data });
    return NextResponse.json({ item });
  } catch (error) {
    console.error("Inventory PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/inventory/[id]
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
    await prisma.inventoryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inventory DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}

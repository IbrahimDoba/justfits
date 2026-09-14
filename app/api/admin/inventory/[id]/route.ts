import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import type { Prisma } from "@prisma/client";

const num = (v: unknown) =>
  v === null || v === undefined ? null : Number(v);

// GET /api/admin/inventory/[id] - single item + sibling sizes (same product)
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
    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    const siblings = await prisma.inventoryItem.findMany({
      where: { name: item.name },
      orderBy: { size: "asc" },
      select: { id: true, size: true, quantity: true, sellingPrice: true },
    });
    return NextResponse.json({
      item: {
        ...item,
        costPrice: num(item.costPrice),
        sellingPrice: num(item.sellingPrice),
      },
      siblings: siblings.map((s) => ({
        ...s,
        sellingPrice: num(s.sellingPrice),
      })),
    });
  } catch (error) {
    console.error("Inventory GET one error:", error);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

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
    if (body.description !== undefined)
      data.description = body.description?.trim() || null;
    if (body.category !== undefined && ["CAP", "SHIRT", "OTHER"].includes(body.category))
      data.category = body.category;
    if (body.size !== undefined) data.size = body.size?.trim() || null;
    if (body.sku !== undefined) data.sku = body.sku?.trim() || null;
    if (body.costPrice !== undefined) data.costPrice = num(body.costPrice);
    if (body.sellingPrice !== undefined)
      data.sellingPrice = num(body.sellingPrice);
    if (body.quantity !== undefined)
      data.quantity = Math.max(0, parseInt(body.quantity, 10) || 0);
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    // Gallery: `images` is the source; the cover (imageUrl) is images[0].
    let galleryChanged = false;
    if (Array.isArray(body.images)) {
      const gallery = body.images
        .map((u: unknown) => String(u).trim())
        .filter(Boolean);
      data.images = gallery;
      data.imageUrl = gallery[0] || null;
      galleryChanged = true;
    } else if (body.imageUrl !== undefined) {
      data.imageUrl = body.imageUrl?.trim() || null;
      galleryChanged = true;
    }

    const item = await prisma.inventoryItem.update({ where: { id }, data });

    // Images are shared across all sizes of a product — propagate them.
    if (galleryChanged) {
      await prisma.inventoryItem.updateMany({
        where: { name: item.name, id: { not: item.id } },
        data: { images: item.images, imageUrl: item.imageUrl },
      });
    }

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

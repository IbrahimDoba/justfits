import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { syncInventoryFromProducts } from "@/lib/inventory/sync";

// POST /api/admin/inventory/import
// Adds an inventory item for every catalog product not already in inventory.
// Idempotent; never modifies existing items (manual edits are preserved).
export async function POST() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { created, totalProducts } = await syncInventoryFromProducts(prisma);
    return NextResponse.json({
      created,
      totalProducts,
      message:
        created > 0
          ? `Added ${created} product${created === 1 ? "" : "s"} to inventory.`
          : "Inventory is already up to date with your products.",
    });
  } catch (error) {
    console.error("Inventory import error:", error);
    return NextResponse.json(
      { error: "Failed to import products" },
      { status: 500 }
    );
  }
}

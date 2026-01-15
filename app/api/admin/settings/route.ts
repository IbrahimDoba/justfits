import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export async function GET() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Fix for stale global prisma instance in dev
    let db: any = prisma;
    if (!(prisma as any).storeSetting) {
      console.log("Global prisma instance is stale, creating new instance");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      db = new PrismaClient({ adapter });
    }

    let settings = await db.storeSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await db.storeSetting.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const data = await req.json();

    // Convert string values to numbers
    const settingsData = {
      storeName: data.storeName,
      storeEmail: data.storeEmail,
      storePhone: data.storePhone,
      bankName: data.bankName,
      bankAccountName: data.bankAccountName,
      bankAccountNumber: data.bankAccountNumber,
      currency: data.currency,
      taxRate: parseFloat(data.taxRate) || 0,
      shippingFee: parseFloat(data.shippingFee) || 0,
      freeShippingThreshold: data.freeShippingThreshold
        ? parseFloat(data.freeShippingThreshold)
        : null,
      lowStockThreshold: parseInt(data.lowStockThreshold) || 10,
    };

    // Fix for stale global prisma instance in dev
    let db: any = prisma;
    if (!(prisma as any).storeSetting) {
      console.log("Global prisma instance is stale, creating new instance");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      db = new PrismaClient({ adapter });
    }

    const settings = await db.storeSetting.upsert({
      where: { id: "default" },
      update: settingsData,
      create: {
        id: "default",
        ...settingsData,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

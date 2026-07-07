import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin-guard";
import type { Prisma } from "@prisma/client";
import { EXPENSE_CATEGORIES } from "@/lib/finance/constants";

// GET /api/admin/finance/expenses - list expenses
export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Prisma.ExpenseWhereInput = {};
    if (search) {
      where.description = { contains: search, mode: "insensitive" };
    }
    if (category && EXPENSE_CATEGORIES.includes(category as never)) {
      where.category = category as Prisma.ExpenseWhereInput["category"];
    }
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      expenses: expenses.map((e) => ({ ...e, amount: Number(e.amount) })),
    });
  } catch (error) {
    console.error("Finance expenses GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST /api/admin/finance/expenses - create an expense
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const amount = Number(body.amount);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "A positive amount is required" },
        { status: 400 }
      );
    }

    const category = EXPENSE_CATEGORIES.includes(body.category)
      ? body.category
      : "OTHER";

    const expense = await prisma.expense.create({
      data: {
        date: body.date ? new Date(body.date) : new Date(),
        category,
        description: body.description?.trim() || null,
        amount,
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error("Finance expenses POST error:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}

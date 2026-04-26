import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { expenseTag } from "@/lib/data";
import { z } from "zod";
import { getMonthRange, currentYearMonth } from "@/lib/utils";

const createSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  note: z.string().optional(),
  date: z.string(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const month = req.nextUrl.searchParams.get("month") ?? currentYearMonth();
  const { start, end } = getMonthRange(month);

  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id, date: { gte: start, lte: end } },
    orderBy: { date: "desc" },
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  return NextResponse.json({ expenses, total });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const expense = await prisma.expense.create({
    data: {
      userId: session.user.id,
      amount: parsed.data.amount,
      category: parsed.data.category,
      note: parsed.data.note,
      date: new Date(parsed.data.date),
    },
  });

  revalidateTag(expenseTag(session.user.id));
  return NextResponse.json(expense, { status: 201 });
}

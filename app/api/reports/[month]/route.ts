import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMonthRange, getCategoryMeta } from "@/lib/utils";
import { format } from "date-fns";

export async function GET(
  _req: NextRequest,
  { params }: { params: { month: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { start, end } = getMonthRange(params.month);

  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id, date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  // Group by day for the bar chart
  const dailyMap: Record<string, number> = {};
  for (const e of expenses) {
    const day = format(new Date(e.date), "d");
    dailyMap[day] = (dailyMap[day] ?? 0) + e.amount;
  }
  const dailyData = Object.entries(dailyMap).map(([day, amount]) => ({ day, amount }));

  // Group by category
  const catMap: Record<string, number> = {};
  for (const e of expenses) {
    catMap[e.category] = (catMap[e.category] ?? 0) + e.amount;
  }
  const categoryData = Object.entries(catMap)
    .map(([category, amount]) => ({
      category,
      label: getCategoryMeta(category).label,
      icon: getCategoryMeta(category).icon,
      amount,
      percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const daysWithExpenses = Object.keys(dailyMap).length;
  const dailyAvg = daysWithExpenses > 0 ? Math.round(totalSpent / daysWithExpenses) : 0;

  return NextResponse.json({ totalSpent, dailyAvg, dailyData, categoryData });
}

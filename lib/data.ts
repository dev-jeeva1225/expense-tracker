import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { getMonthRange } from "./utils";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

// Cache tag helpers — used by pages (to read) and API routes (to invalidate)
export const expenseTag = (userId: string) => `expenses:${userId}`;
export const debtTag = (userId: string) => `debts:${userId}`;

export function getDashboardData(userId: string, dateStr: string) {
  return unstable_cache(
    async () => {
      const today = new Date();
      const [todayExpenses, monthAgg, unsettledDebts] = await Promise.all([
        prisma.expense.findMany({
          where: { userId, date: { gte: startOfDay(today), lte: endOfDay(today) } },
          orderBy: { date: "desc" },
        }),
        prisma.expense.aggregate({
          where: { userId, date: { gte: startOfMonth(today), lte: endOfMonth(today) } },
          _sum: { amount: true },
        }),
        prisma.debtRecord.findMany({
          where: { userId, settled: false },
        }),
      ]);
      return { todayExpenses, monthAgg, unsettledDebts };
    },
    ["dashboard", userId, dateStr],
    { tags: [expenseTag(userId), debtTag(userId)], revalidate: 60 }
  )();
}

export function getExpenses(userId: string, month: string) {
  return unstable_cache(
    async () => {
      const { start, end } = getMonthRange(month);
      return prisma.expense.findMany({
        where: { userId, date: { gte: start, lte: end } },
        orderBy: { date: "desc" },
      });
    },
    ["expenses", userId, month],
    { tags: [expenseTag(userId)], revalidate: 60 }
  )();
}

export function getDebts(userId: string) {
  return unstable_cache(
    async () =>
      prisma.debtRecord.findMany({
        where: { userId, settled: false },
        orderBy: { date: "desc" },
      }),
    ["debts", userId],
    { tags: [debtTag(userId)], revalidate: 60 }
  )();
}

export function getReportExpenses(userId: string, month: string) {
  return unstable_cache(
    async () => {
      const { start, end } = getMonthRange(month);
      return prisma.expense.findMany({
        where: { userId, date: { gte: start, lte: end } },
        orderBy: { date: "asc" },
      });
    },
    ["report", userId, month],
    { tags: [expenseTag(userId)], revalidate: 60 }
  )();
}

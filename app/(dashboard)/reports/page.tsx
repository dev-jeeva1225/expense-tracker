import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency, formatMonth, currentYearMonth, getCategoryMeta } from "@/lib/utils";
import { getReportExpenses } from "@/lib/data";
import { format } from "date-fns";
import DailySpendChart from "@/components/DailySpendChart";
import CategoryChart from "@/components/CategoryChart";
import MonthPicker from "@/components/MonthPicker";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const month = searchParams.month ?? currentYearMonth();
  const expenses = await getReportExpenses(session.user.id, month);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  const dailyMap: Record<string, number> = {};
  for (const e of expenses) {
    const day = format(new Date(e.date), "d");
    dailyMap[day] = (dailyMap[day] ?? 0) + e.amount;
  }
  const dailyData = Object.entries(dailyMap).map(([day, amount]) => ({ day, amount }));

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
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-900">Reports</h1>

      {/* Month picker */}
      <MonthPicker current={month} basePath="/reports" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <p className="text-xs text-slate-500 mb-1">Total Spent</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500 mb-1">Avg / Active Day</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(dailyAvg)}</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium">No data for {formatMonth(month)}</p>
        </div>
      ) : (
        <>
          {/* Daily chart */}
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Daily Spending</h2>
            <DailySpendChart data={dailyData} />
          </div>

          {/* Category chart */}
          {categoryData.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">By Category</h2>
              <CategoryChart data={categoryData} />
            </div>
          )}

          {/* Category list */}
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Breakdown</h2>
            <div className="space-y-3">
              {categoryData.map((c) => (
                <div key={c.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700 flex items-center gap-2">
                      <span>{c.icon}</span> {c.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {formatCurrency(c.amount)}{" "}
                      <span className="text-xs font-normal text-slate-400">({c.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

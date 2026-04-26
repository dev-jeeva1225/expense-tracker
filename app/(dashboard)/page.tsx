import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { formatCurrency, getCategoryMeta } from "@/lib/utils";
import { getDashboardData } from "@/lib/data";
import Link from "next/link";
import { Plus, TrendingDown, Calendar, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const now = new Date();
  const dateStr = format(now, "yyyy-MM-dd");
  const { todayExpenses, monthAgg, unsettledDebts } = await getDashboardData(session.user.id, dateStr);

  const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const monthTotal = monthAgg._sum.amount ?? 0;
  const iOweTotal = unsettledDebts
    .filter((d) => d.direction === "I_OWE")
    .reduce((s, d) => s + d.amount, 0);
  const owedToMeTotal = unsettledDebts
    .filter((d) => d.direction === "OWED_TO_ME")
    .reduce((s, d) => s + d.amount, 0);

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {firstName}!
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">{format(now, "EEEE, d MMMM yyyy")}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <Calendar className="w-4 h-4" />
            Today
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(todayTotal)}</p>
          <p className="text-xs text-slate-400 mt-1">{todayExpenses.length} entries</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <TrendingDown className="w-4 h-4" />
            This Month
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(monthTotal)}</p>
          <p className="text-xs text-slate-400 mt-1">{format(now, "MMMM yyyy")}</p>
        </div>
      </div>

      {/* Debt summary */}
      {(iOweTotal > 0 || owedToMeTotal > 0) && (
        <div className="card border-l-4 border-l-amber-400">
          <div className="flex items-center gap-2 text-amber-600 font-medium text-sm mb-3">
            <AlertCircle className="w-4 h-4" />
            Outstanding Debts
          </div>
          <div className="flex gap-6">
            {iOweTotal > 0 && (
              <div>
                <p className="text-xs text-slate-500">I Owe</p>
                <p className="font-semibold text-red-600">{formatCurrency(iOweTotal)}</p>
              </div>
            )}
            {owedToMeTotal > 0 && (
              <div>
                <p className="text-xs text-slate-500">Owed to Me</p>
                <p className="font-semibold text-green-600">{formatCurrency(owedToMeTotal)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add expense CTA */}
      <Link href="/expenses/new" className="btn-primary flex items-center justify-center gap-2 w-full py-3 text-base">
        <Plus className="w-5 h-5" />
        Add Expense
      </Link>

      {/* Today's entries */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">
          {todayExpenses.length === 0 ? "No expenses logged today" : "Today's Expenses"}
        </h2>

        {todayExpenses.length > 0 && (
          <div className="card divide-y divide-slate-50">
            {todayExpenses.map((exp) => {
              const cat = getCategoryMeta(exp.category);
              return (
                <div key={exp.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{cat.label}</p>
                      {exp.note && <p className="text-xs text-slate-400">{exp.note}</p>}
                    </div>
                  </div>
                  <p className="font-semibold text-red-600">{formatCurrency(exp.amount)}</p>
                </div>
              );
            })}
            <div className="flex justify-between pt-3 mt-1">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <span className="font-bold text-slate-900">{formatCurrency(todayTotal)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

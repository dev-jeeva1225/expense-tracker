import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatMonth, currentYearMonth, getCategoryMeta } from "@/lib/utils";
import { getExpenses } from "@/lib/data";
import { format } from "date-fns";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import DeleteExpenseButton from "@/components/DeleteExpenseButton";
import MonthPicker from "@/components/MonthPicker";

const DAYS_PER_PAGE = 7;

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { month?: string; page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const month = searchParams.month ?? currentYearMonth();
  const expenses = await getExpenses(session.user.id, month);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  // Group by date string, sorted newest first
  const grouped: Record<string, typeof expenses> = {};
  for (const exp of expenses) {
    const key = format(new Date(exp.date), "yyyy-MM-dd");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(exp);
  }
  const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Pagination over day groups
  const totalPages = Math.max(1, Math.ceil(sortedDays.length / DAYS_PER_PAGE));
  const page = Math.min(Math.max(1, parseInt(searchParams.page ?? "1", 10)), totalPages);
  const pagedDays = sortedDays.slice((page - 1) * DAYS_PER_PAGE, page * DAYS_PER_PAGE);

  const pageTransactions = pagedDays.reduce((s, d) => s + grouped[d].length, 0);

  const pageUrl = (p: number) =>
    `/expenses?month=${month}&page=${p}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Expenses</h1>
        <Link href="/expenses/new" className="btn-primary flex items-center gap-1 text-sm">
          <Plus className="w-4 h-4" />
          Add
        </Link>
      </div>

      {/* Month picker */}
      <MonthPicker current={month} basePath="/expenses" />

      {/* Total */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-slate-500">{expenses.length} transactions</span>
        <span className="font-bold text-slate-900 text-lg">{formatCurrency(total)}</span>
      </div>

      {/* Grouped list */}
      {expenses.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">No expenses for {formatMonth(month)}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {pagedDays.map((dateKey) => {
              const items = grouped[dateKey];
              const dayTotal = items.reduce((s, e) => s + e.amount, 0);
              return (
                <div key={dateKey} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-600">
                      {format(new Date(dateKey), "EEEE, d MMMM")}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {formatCurrency(dayTotal)}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {items.map((exp) => {
                      const cat = getCategoryMeta(exp.category);
                      return (
                        <div
                          key={exp.id}
                          className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{cat.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{cat.label}</p>
                              {exp.note && <p className="text-xs text-slate-400">{exp.note}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-red-600 text-sm">
                              {formatCurrency(exp.amount)}
                            </span>
                            <DeleteExpenseButton id={exp.id} month={month} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              {page > 1 ? (
                <Link
                  href={pageUrl(page - 1)}
                  className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Newer
                </Link>
              ) : (
                <span />
              )}
              <span className="text-xs text-slate-400">
                {pageTransactions} of {expenses.length} transactions &middot; page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={pageUrl(page + 1)}
                  className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Older
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

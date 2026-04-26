import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getDebts } from "@/lib/data";
import DebtActions from "@/components/DebtActions";
import AddDebtButton from "@/components/AddDebtButton";

export default async function DebtsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const debts = await getDebts(session.user.id);

  const iOwe = debts.filter((d) => d.direction === "I_OWE");
  const owedToMe = debts.filter((d) => d.direction === "OWED_TO_ME");

  const iOweTotal = iOwe.reduce((s, d) => s + d.amount, 0);
  const owedToMeTotal = owedToMe.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Debts & Credits</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track who owes who</p>
        </div>
        <AddDebtButton />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card border-l-4 border-l-red-400">
          <p className="text-xs text-slate-500 mb-1">I Owe</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(iOweTotal)}</p>
          <p className="text-xs text-slate-400">{iOwe.length} pending</p>
        </div>
        <div className="card border-l-4 border-l-green-400">
          <p className="text-xs text-slate-500 mb-1">Owed to Me</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(owedToMeTotal)}</p>
          <p className="text-xs text-slate-400">{owedToMe.length} pending</p>
        </div>
      </div>

      {/* I Owe section */}
      {iOwe.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">
            I Owe
          </h2>
          <div className="card divide-y divide-slate-50">
            {iOwe.map((debt) => (
              <DebtRow key={debt.id} debt={debt} />
            ))}
          </div>
        </div>
      )}

      {/* Owed to me section */}
      {owedToMe.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">
            Owed to Me
          </h2>
          <div className="card divide-y divide-slate-50">
            {owedToMe.map((debt) => (
              <DebtRow key={debt.id} debt={debt} />
            ))}
          </div>
        </div>
      )}

      {debts.length === 0 && (
        <div className="card text-center py-12 text-slate-400">
          <p className="text-4xl mb-3">🤝</p>
          <p className="font-medium">All clear! No outstanding debts.</p>
        </div>
      )}
    </div>
  );
}

function DebtRow({ debt }: { debt: { id: string; counterparty: string; amount: number; direction: string; note: string | null; date: Date } }) {
  const isIOwe = debt.direction === "I_OWE";
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800">{debt.counterparty}</p>
          {debt.note && <p className="text-xs text-slate-400 mt-0.5 truncate">{debt.note}</p>}
          <p className="text-xs text-slate-400 mt-0.5">{formatDate(debt.date)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`font-bold text-sm ${isIOwe ? "text-red-600" : "text-green-600"}`}>
            {formatCurrency(debt.amount)}
          </span>
          <DebtActions id={debt.id} />
        </div>
      </div>
    </div>
  );
}

import ExpenseForm from "@/components/ExpenseForm";

export default function NewExpensePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Add Expense</h1>
        <p className="text-slate-500 text-sm mt-0.5">Log every rupee you spend</p>
      </div>
      <ExpenseForm />
    </div>
  );
}

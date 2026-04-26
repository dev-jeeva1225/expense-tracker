"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CATEGORIES, FOOD_SUBCATEGORIES, isFoodCategory } from "@/lib/utils";

export default function ExpenseForm() {
  const router = useRouter();
  const today = format(new Date(), "yyyy-MM-dd");

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food_lunch");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        category,
        note: note.trim() || undefined,
        date: new Date(date).toISOString(),
      }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/expenses");
      router.refresh();
    } else {
      setError("Failed to save expense. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {/* Amount — big and prominent */}
      <div>
        <label className="form-label">Amount (₹)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-semibold">₹</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-input pl-9 text-2xl font-bold h-14"
            placeholder="0"
            required
            autoFocus
          />
        </div>
      </div>

      {/* Category grid */}
      <div>
        <label className="form-label">Category</label>
        <div className="grid grid-cols-5 gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = cat.value === "food"
              ? isFoodCategory(category)
              : category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  if (cat.value === "food") {
                    // Select a sensible default sub-category on first click
                    if (!isFoodCategory(category)) setCategory("food_lunch");
                  } else {
                    setCategory(cat.value);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border-2 transition-colors text-xs ${
                  isActive
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-100 hover:border-slate-200 text-slate-600"
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="leading-tight text-center" style={{ fontSize: "0.65rem" }}>
                  {cat.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Food sub-categories — visible only when Food is selected */}
        {isFoodCategory(category) && (
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {FOOD_SUBCATEGORIES.map((sub) => (
              <button
                key={sub.value}
                type="button"
                onClick={() => setCategory(sub.value)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border-2 text-xs font-medium transition-colors ${
                  category === sub.value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-100 hover:border-slate-200 text-slate-600"
                }`}
              >
                <span className="text-base">{sub.icon}</span>
                <span>{sub.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="form-label">Date</label>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          className="form-input"
          required
        />
      </div>

      {/* Note */}
      <div>
        <label className="form-label">
          Note <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="form-input"
          placeholder="e.g. Lunch with team"
          maxLength={100}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
          {loading ? "Saving…" : "Save Expense"}
        </button>
      </div>
    </form>
  );
}

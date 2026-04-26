"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function DebtForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const today = format(new Date(), "yyyy-MM-dd");

  const [counterparty, setCounterparty] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"I_OWE" | "OWED_TO_ME">("I_OWE");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!counterparty.trim()) { setError("Enter a name"); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError("Enter a valid amount"); return; }
    setError("");
    setLoading(true);

    const res = await fetch("/api/debts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        counterparty: counterparty.trim(),
        amount: Number(amount),
        direction,
        note: note.trim() || undefined,
        date: new Date(date).toISOString(),
      }),
    });

    setLoading(false);
    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      setError("Failed to save. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      {/* Direction toggle */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-1">
        {(["I_OWE", "OWED_TO_ME"] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDirection(d)}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              direction === d
                ? d === "I_OWE"
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
                : "text-slate-600"
            }`}
          >
            {d === "I_OWE" ? "I Owe" : "Owed to Me"}
          </button>
        ))}
      </div>

      <div>
        <label className="form-label">{direction === "I_OWE" ? "Lender" : "Borrower"} Name</label>
        <input
          type="text"
          value={counterparty}
          onChange={(e) => setCounterparty(e.target.value)}
          className="form-input"
          placeholder="Person's name"
          autoFocus
        />
      </div>

      <div>
        <label className="form-label">Amount (₹)</label>
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="form-input"
          placeholder="0"
        />
      </div>

      <div>
        <label className="form-label">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
      </div>

      <div>
        <label className="form-label">Note <span className="text-slate-400 font-normal">(optional)</span></label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="form-input"
          placeholder="e.g. Dinner split"
          maxLength={100}
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
          {loading ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

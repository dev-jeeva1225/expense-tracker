"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";

export default function DebtActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function settle() {
    if (!confirm("Mark this as settled?")) return;
    setLoading(true);
    await fetch(`/api/debts/${id}`, { method: "PATCH" });
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this record?")) return;
    setLoading(true);
    await fetch(`/api/debts/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={settle}
        disabled={loading}
        className="p-1.5 rounded-lg text-slate-300 hover:text-green-500 hover:bg-green-50 transition-colors disabled:opacity-40"
        title="Mark settled"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={remove}
        disabled={loading}
        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

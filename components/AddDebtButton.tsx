"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import DebtForm from "./DebtForm";

export default function AddDebtButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-1 text-sm">
        <Plus className="w-4 h-4" />
        Add
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Add Debt / Credit</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            <DebtForm onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

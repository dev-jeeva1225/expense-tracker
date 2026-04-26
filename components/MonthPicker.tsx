"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { formatMonth, prevMonth, nextMonth, currentYearMonth } from "@/lib/utils";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MIN_YEAR = 2020;

interface Props {
  current: string; // "yyyy-MM"
  basePath: string; // "/expenses" or "/reports"
}

export default function MonthPicker({ current, basePath }: Props) {
  const router = useRouter();
  const today = currentYearMonth();
  const [todayYear, todayMonth] = today.split("-").map(Number);
  const [currentYear] = current.split("-").map(Number);

  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentYear);

  const isCurrentMonth = current === today;

  function navigate(month: string) {
    router.push(`${basePath}?month=${month}`);
  }

  function selectMonth(monthIndex: number) {
    const mm = String(monthIndex + 1).padStart(2, "0");
    navigate(`${pickerYear}-${mm}`);
    setOpen(false);
  }

  function openPicker() {
    setPickerYear(currentYear);
    setOpen(true);
  }

  function isMonthDisabled(monthIndex: number) {
    const m = monthIndex + 1;
    return pickerYear > todayYear || (pickerYear === todayYear && m > todayMonth);
  }

  function isMonthSelected(monthIndex: number) {
    const mm = String(monthIndex + 1).padStart(2, "0");
    return current === `${pickerYear}-${mm}`;
  }

  return (
    <div className="card flex items-center justify-between py-3 relative">
      {/* Prev arrow */}
      <button
        onClick={() => navigate(prevMonth(current))}
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-5 h-5 text-slate-600" />
      </button>

      {/* Clickable month label */}
      <button
        onClick={openPicker}
        className="flex items-center gap-1.5 font-semibold text-slate-800 hover:text-indigo-600 transition-colors rounded-lg px-2 py-1 hover:bg-indigo-50"
      >
        {formatMonth(current)}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Next arrow — disabled on current month */}
      <button
        onClick={() => !isCurrentMonth && navigate(nextMonth(current))}
        disabled={isCurrentMonth}
        className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${isCurrentMonth ? "opacity-30 cursor-not-allowed" : ""}`}
        aria-label="Next month"
      >
        <ChevronRight className="w-5 h-5 text-slate-600" />
      </button>

      {/* Dropdown picker */}
      {open && (
        <>
          {/* Click-outside backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 p-4">
            {/* Year navigator */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setPickerYear((y) => Math.max(MIN_YEAR, y - 1))}
                disabled={pickerYear <= MIN_YEAR}
                className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${pickerYear <= MIN_YEAR ? "opacity-30 cursor-not-allowed" : ""}`}
                aria-label="Previous year"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="font-semibold text-slate-800 text-sm">{pickerYear}</span>
              <button
                onClick={() => setPickerYear((y) => Math.min(todayYear, y + 1))}
                disabled={pickerYear >= todayYear}
                className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${pickerYear >= todayYear ? "opacity-30 cursor-not-allowed" : ""}`}
                aria-label="Next year"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Month grid — 4 columns × 3 rows */}
            <div className="grid grid-cols-4 gap-1.5">
              {MONTH_LABELS.map((label, i) => {
                const disabled = isMonthDisabled(i);
                const selected = isMonthSelected(i);
                return (
                  <button
                    key={label}
                    onClick={() => !disabled && selectMonth(i)}
                    disabled={disabled}
                    className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                      selected
                        ? "bg-indigo-600 text-white"
                        : disabled
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

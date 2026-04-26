"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  data: { day: string; amount: number }[];
}

const COLORS = ["#6366f1", "#818cf8", "#a5b4fc"];

function formatRupee(value: number) {
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${value}`;
}

export default function DailySpendChart({ data }: Props) {
  if (data.length === 0) return null;

  const sorted = [...data].sort((a, b) => Number(a.day) - Number(b.day));
  const max = Math.max(...sorted.map((d) => d.amount));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={sorted} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatRupee}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Spent"]}
          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
          cursor={{ fill: "#f1f5f9" }}
        />
        <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
          {sorted.map((entry, i) => (
            <Cell
              key={`cell-${i}`}
              fill={entry.amount === max ? "#4f46e5" : "#c7d2fe"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CategoryData {
  category: string;
  label: string;
  icon: string;
  amount: number;
  percentage: number;
}

interface Props {
  data: CategoryData[];
}

const PALETTE = [
  "#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
];

export default function CategoryChart({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [
            `₹${value.toLocaleString("en-IN")}`,
            name,
          ]}
          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: "11px", color: "#64748b" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

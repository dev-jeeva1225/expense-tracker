import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfMonth, endOfMonth } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  return format(new Date(year, month - 1), "MMMM yyyy");
}

export function currentYearMonth(): string {
  return format(new Date(), "yyyy-MM");
}

export function getMonthRange(yearMonth: string) {
  const [year, month] = yearMonth.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return { start: startOfMonth(d), end: endOfMonth(d) };
}

export function prevMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  const d = new Date(year, month - 2, 1);
  return format(d, "yyyy-MM");
}

export function nextMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  const d = new Date(year, month, 1);
  return format(d, "yyyy-MM");
}

export const CATEGORIES = [
  { value: "food", label: "Food & Dining", icon: "🍽️" },
  { value: "transport", label: "Transport", icon: "🚗" },
  { value: "housing", label: "Housing & Rent", icon: "🏠" },
  { value: "entertainment", label: "Entertainment", icon: "🎮" },
  { value: "health", label: "Health & Medical", icon: "🏥" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "utilities", label: "Utilities", icon: "💡" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "subscriptions", label: "Subscriptions", icon: "📱" },
  { value: "other", label: "Other", icon: "💰" },
] as const;

export const FOOD_SUBCATEGORIES = [
  { value: "food_snacks", label: "Snacks", icon: "🍿" },
  { value: "food_breakfast", label: "Breakfast", icon: "🍳" },
  { value: "food_lunch", label: "Lunch", icon: "🍱" },
  { value: "food_dinner", label: "Dinner", icon: "🍛" },
  { value: "food_coffee", label: "Coffee / Tea", icon: "☕" },
  { value: "food_beverages", label: "Beverages", icon: "🥤" },
] as const;

const ALL_CATEGORIES = [...CATEGORIES, ...FOOD_SUBCATEGORIES];

export type Category = (typeof ALL_CATEGORIES)[number]["value"];

export function getCategoryMeta(value: string) {
  return ALL_CATEGORIES.find((c) => c.value === value) ?? { value, label: value, icon: "💰" };
}

export function isFoodCategory(value: string) {
  return value === "food" || value.startsWith("food_");
}

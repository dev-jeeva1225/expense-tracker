"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Receipt, HandCoins, BarChart3, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/debts", label: "Debts", icon: HandCoins },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navigation({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-slate-900 text-white">
        <div className="px-5 py-6 border-b border-slate-700/50">
          <p className="font-bold text-lg">💰 Expense Tracker</p>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{user.email}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4.5 h-4.5 w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700/50">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50">
        <div className="flex">
          {links.slice(0, 4).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors",
                isActive(href) ? "text-indigo-600" : "text-slate-400"
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
          <Link
            href="/settings"
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors",
              pathname === "/settings" ? "text-indigo-600" : "text-slate-400"
            )}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </div>
      </nav>
    </>
  );
}

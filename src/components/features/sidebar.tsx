"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navItems: {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  shortcut?: string;
}[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    shortcut: "D",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "Invoices",
    href: "/dashboard/invoices",
    shortcut: "I",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: "Create Invoice",
    href: "/dashboard/invoices/new",
    shortcut: "C",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: "Activity Log",
    href: "/dashboard/activity",
    adminOnly: true,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function toggleTheme() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark");
  try {
    localStorage.setItem(
      "theme",
      root.classList.contains("dark") ? "dark" : "light"
    );
  } catch {
    /* ignore */
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.user && setUser(data.user))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="no-print flex w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] backdrop-blur-md md:w-64 max-md:w-[60px]">
      {/* Brand Logo Header */}
      <div className="flex h-14 items-center border-b border-[var(--border)] px-4 select-none md:px-6 md:justify-start max-md:justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white shadow-sm" style={{ transform: "rotate(-12deg)" }}>
          I
        </div>
        <div className="ml-2 hidden md:block">
          <h1 className="text-sm font-bold tracking-tight text-slate-950 flex items-center gap-1.5 dark:text-white">
            InvoiceLoop
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 font-medium dark:text-slate-400 dark:text-slate-500">Merchant Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar px-2 py-3 md:px-3 md:py-4" aria-label="Primary">
        <p className="px-2 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none dark:text-slate-500 hidden md:block">
          Management
        </p>

        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== "ADMIN") return null;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              title={item.label}
              className={cn(
                "flex items-center rounded-xl px-3 py-2.5 text-sm transition-all md:justify-between md:px-4 md:py-3",
                "justify-center",
                isActive
                  ? "bg-emerald-50/80 text-emerald-600 border border-emerald-100/10 font-semibold dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "text-slate-600 hover:bg-[var(--surface-elevated)] hover:text-slate-900 font-medium dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <span className={cn(isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500")}>
                {item.icon}
              </span>
              <span className="hidden md:inline ml-3 flex-1">{item.label}</span>
              {item.shortcut && (
                <kbd className="hidden md:inline text-[10px] bg-[var(--surface)] text-slate-500 border border-[var(--border)] rounded px-1.5 py-0.5 dark:text-slate-400 dark:text-slate-500">
                  {item.shortcut}
                </kbd>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Segment */}
      <div className="border-t border-[var(--border)] bg-[var(--surface-elevated)] rounded-2xl mx-2 mb-2 p-2 space-y-2 md:mx-3 md:mb-3 md:p-4 md:space-y-4">
        {user ? (
          <>
            <Link
              href="/dashboard/settings"
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--surface-elevated)] md:px-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-semibold text-xs md:h-9 md:w-9 md:text-sm">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0 hidden md:block">
                  <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate dark:text-slate-400 dark:text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>
              <span className="hidden md:inline shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-100/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/20">
                {user.role}
              </span>
            </Link>

            <div className="space-y-1">
              <button
                type="button"
                onClick={toggleTheme}
                title="Toggle theme"
                aria-label="Toggle theme"
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-[var(--surface-elevated)] hover:text-slate-900 dark:text-slate-400 dark:hover:text-white justify-center md:justify-start md:px-3"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
                <span className="hidden md:inline">Toggle Theme</span>
              </button>

              <button
                onClick={handleLogout}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-[var(--surface-elevated)] hover:text-slate-900",
                  "dark:text-slate-400 dark:hover:text-white",
                  "justify-center md:justify-start md:px-3"
                )}
                title="Sign Out"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center md:justify-start md:gap-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--surface-elevated)] md:h-9 md:w-9" />
            <div className="hidden md:flex flex-1 space-y-1.5">
              <div className="h-3 w-24 animate-pulse rounded bg-[var(--surface-elevated)]" />
              <div className="h-2.5 w-32 animate-pulse rounded bg-[var(--surface-elevated)]" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
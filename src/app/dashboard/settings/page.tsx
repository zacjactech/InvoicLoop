"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
  customerCount: number;
  invoiceCount: number;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatJoinedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        setUser(data?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Workspace configuration
          </p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass animate-pulse rounded-2xl p-6">
              <div className="h-3 w-24 rounded bg-[var(--surface-elevated)]" />
              <div className="mt-3 h-6 w-40 rounded bg-[var(--surface-elevated)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Workspace configuration
        </p>
      </div>

      {user ? (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3 dark:text-slate-400 dark:border-slate-700/50">
              Profile
            </h2>

            <div className="flex items-center gap-4 pt-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white"
                style={{ transform: "rotate(-12deg)" }}
              >
                {initialsFor(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                  {user.email}
                </p>
              </div>
              <Badge variant={user.role === "ADMIN" ? "paid" : "draft"}>
                {user.role}
              </Badge>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 dark:border-slate-700/50">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Member since
                </dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                  {formatJoinedDate(user.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Account ID
                </dt>
                <dd className="mt-1 truncate font-mono text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  {user.id}
                </dd>
              </div>
            </dl>
          </div>

          <div className="glass rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3 dark:text-slate-400 dark:border-slate-700/50">
              Workspace
            </h2>
            <p className="pt-3 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
              Plan, role, and activity access at a glance.
            </p>

            <dl className="mt-4 divide-y divide-slate-100 dark:divide-slate-700/50">
              {[
                { label: "Plan", value: "Free" },
                { label: "Your role", value: user.role },
                { label: "Activity log access", value: user.role === "ADMIN" ? "Full access" : "View only" },
                { label: "Customers in workspace", value: String(user.customerCount) },
                { label: "Invoices issued", value: String(user.invoiceCount) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <dt className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{label}</dt>
                  <dd className="text-sm font-semibold text-slate-900 dark:text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 text-center shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Unable to load your account. Sign out and back in to retry.
          </p>
        </div>
      )}
    </div>
  );
}
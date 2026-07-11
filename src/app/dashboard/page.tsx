"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/features/metric-card";
import { RevenueChart } from "@/components/features/revenue-chart";
import { Badge, invoiceStatusVariant } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";

interface DashboardData {
  totalRevenue: number;
  outstandingBalance: number;
  paidCount: number;
  totalCount: number;
  overdueCount: number;
  averageDaysToPay: number | null;
  revenuePercentChange: number | null;
  recentInvoices: {
    id: string;
    invoiceNumber: string;
    status: string;
    total: number;
    dueDate: string;
    customer: { name: string };
  }[];
  monthlyRevenue: { label: string; value: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((res) => {
        setData({
          totalRevenue: res.totalRevenue ?? 0,
          outstandingBalance: res.outstandingBalance ?? 0,
          paidCount: res.paidCount ?? 0,
          totalCount: res.totalCount ?? 0,
          overdueCount: res.overdueCount ?? 0,
          averageDaysToPay: res.averageDaysToPay ?? null,
          revenuePercentChange: res.revenuePercentChange ?? null,
          recentInvoices: res.recentInvoices ?? [],
          monthlyRevenue: res.monthlyRevenue ?? [],
        });
      })
      .catch(() => {
        setData({
          totalRevenue: 0,
          outstandingBalance: 0,
          paidCount: 0,
          totalCount: 0,
          overdueCount: 0,
          averageDaysToPay: null,
          revenuePercentChange: null,
          recentInvoices: [],
          monthlyRevenue: [],
        });
      });
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="glass animate-pulse rounded-2xl p-6"
            >
              <div className="h-3 w-20 rounded bg-[var(--surface-elevated)]" />
              <div className="mt-3 h-8 w-32 rounded bg-[var(--surface-elevated)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const settlementRate =
    data.totalCount > 0
      ? `${Math.round((data.paidCount / data.totalCount) * 100)}%`
      : "0%";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Financial Summary
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Live
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Monthly Revenue"
          value={formatCurrency(data.totalRevenue)}
          change={
            data.revenuePercentChange === null
              ? "No prior month"
              : `${data.revenuePercentChange >= 0 ? "+" : ""}${data.revenuePercentChange.toFixed(1)}% vs last month`
          }
          changeType={
            data.revenuePercentChange === null
              ? "neutral"
              : data.revenuePercentChange >= 0
                ? "positive"
                : "negative"
          }
        />
        <MetricCard
          label="Overdue Balance"
          value={formatCurrency(data.outstandingBalance)}
          change={`${data.overdueCount} invoice${data.overdueCount !== 1 ? "s" : ""} overdue`}
          changeType={data.overdueCount > 0 ? "negative" : "neutral"}
        />
        <MetricCard
          label="Settlement Rate"
          value={settlementRate}
          change={`${data.paidCount} of ${data.totalCount} paid`}
          changeType="positive"
        />
        <MetricCard
          label="Avg Days to Pay"
          value={
            data.averageDaysToPay === null ? "No data yet" : `${data.averageDaysToPay.toFixed(0)} Days`
          }
          change={`${data.totalCount} invoice${data.totalCount !== 1 ? "s" : ""} tracked`}
          changeType="neutral"
        />
      </div>

      <RevenueChart data={data.monthlyRevenue} />

      <div className="glass rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Recent Invoices
          </h3>
          <Link
            href="/dashboard/invoices"
            className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            View all
          </Link>
        </div>
        <div className="space-y-1">
          {data.recentInvoices.length === 0 ? (
            <EmptyState
              title="No invoices yet"
              description="Create your first invoice to see it appear here."
              cta={{ label: "+ New Invoice", href: "/dashboard/invoices/new" }}
            />
          ) : (
            data.recentInvoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/dashboard/invoices/${invoice.id}`}
                className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-[var(--surface-elevated)]"
              >
                <div>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    {invoice.customer.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(invoice.total)}
                  </p>
                  <Badge variant={invoiceStatusVariant(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
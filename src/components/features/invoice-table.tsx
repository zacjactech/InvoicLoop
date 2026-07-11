"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn, formatCurrency, formatDateShort } from "@/lib/utils";
import { Badge, invoiceStatusVariant } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  balancePaid: number;
  issuedDate: string;
  dueDate: string;
  customer: { name: string; company?: string | null };
}

interface InvoiceTableProps {
  invoices: InvoiceItem[];
  selectedIds?: string[];
  onSelect?: (ids: string[]) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyCtaLabel?: string;
  emptyCtaHref?: string;
}

export function InvoiceTable({
  invoices,
  selectedIds = [],
  onSelect,
  emptyTitle = "No invoices yet",
  emptyDescription = "Create your first invoice to start tracking payments and customer balances.",
  emptyCtaLabel = "+ New Invoice",
  emptyCtaHref = "/dashboard/invoices/new",
}: InvoiceTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const focusedIndexRef = useRef<number>(-1);

  function toggleAll() {
    if (selectedIds.length === invoices.length) {
      onSelect?.([]);
    } else {
      onSelect?.(invoices.map((i) => i.id));
    }
  }

  function toggleOne(id: string) {
    if (selectedIds.includes(id)) {
      onSelect?.(selectedIds.filter((i) => i !== id));
    } else {
      onSelect?.([...selectedIds, id]);
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        focusedIndexRef.current = Math.min(
          invoices.length - 1,
          focusedIndexRef.current + 1
        );
        focusRow(focusedIndexRef.current);
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        focusedIndexRef.current = Math.max(0, focusedIndexRef.current - 1);
        focusRow(focusedIndexRef.current);
      }
    }

    function focusRow(idx: number) {
      if (!tableRef.current) return;
      const rows = tableRef.current.querySelectorAll<HTMLTableRowElement>("tbody tr");
      rows[idx]?.focus();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [invoices]);

  if (invoices.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        cta={emptyCtaHref ? { label: emptyCtaLabel, href: emptyCtaHref } : undefined}
        icon={
          <svg
            className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        }
      />
    );
  }

  return (
    <>
      {/* Desktop: table view */}
      <div ref={tableRef} className="glass rounded-2xl overflow-hidden shadow-sm hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === invoices.length && invoices.length > 0}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-[var(--border)] dark:border-slate-700"
                  />
                </th>
                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Invoice
                </th>
                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Customer
                </th>
                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Status
                </th>
                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Due Date
                </th>
                <th className="p-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      window.location.href = `/dashboard/invoices/${invoice.id}`;
                    }
                  }}
                  className={cn(
                    "transition-colors hover:bg-[var(--surface-elevated)] focus:bg-[var(--surface-elevated)] focus:outline-none",
                    selectedIds.includes(invoice.id) && "bg-[var(--surface-elevated)]"
                  )}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(invoice.id)}
                      onChange={() => toggleOne(invoice.id)}
                      className="h-4 w-4 rounded border-[var(--border)] dark:border-slate-700"
                    />
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {invoice.customer.name}
                    </p>
                    {invoice.customer.company && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {invoice.customer.company}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant={invoiceStatusVariant(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
                      {formatDateShort(invoice.dueDate)}
                    </p>
                  </td>
                  <td className="p-4 text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(invoice.total)}
                    </p>
                    {invoice.balancePaid > 0 && invoice.balancePaid < invoice.total && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {formatCurrency(invoice.balancePaid)} paid
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: card view */}
      <div className="md:hidden space-y-3">
        {invoices.map((invoice) => (
          <Link
            key={invoice.id}
            href={`/dashboard/invoices/${invoice.id}`}
            className="glass block rounded-2xl p-4 shadow-sm transition-colors hover:bg-[var(--surface-elevated)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(invoice.id)}
                    onChange={() => toggleOne(invoice.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 shrink-0 rounded border-[var(--border)] dark:border-slate-700"
                  />
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    {invoice.invoiceNumber}
                  </p>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {invoice.customer.name}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(invoice.total)}
                </p>
                <Badge variant={invoiceStatusVariant(invoice.status)}>
                  {invoice.status}
                </Badge>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>Due {formatDateShort(invoice.dueDate)}</span>
              {invoice.balancePaid > 0 && invoice.balancePaid < invoice.total && (
                <span>{formatCurrency(invoice.balancePaid)} paid</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
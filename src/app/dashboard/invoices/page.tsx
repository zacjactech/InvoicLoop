"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { InvoiceTable } from "@/components/features/invoice-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  balancePaid: number;
  issuedDate: string;
  dueDate: string;
  customer: { name: string; company?: string | null };
}

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Paid", value: "PAID" },
  { label: "Sent", value: "SENT" },
  { label: "Overdue", value: "OVERDUE" },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast } = useToast();

  const fetchInvoices = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);

    const res = await fetch(`/api/invoices?${params}`);
    const data = await res.json();
    setInvoices(data.invoices || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => {
    const handle = setTimeout(() => {
      void fetchInvoices();
    }, 200);
    return () => clearTimeout(handle);
  }, [fetchInvoices]);

  async function handleBulkAction(action: string, opts?: { silentError?: boolean }) {
    if (selectedIds.length === 0) return;

    const res = await fetch("/api/invoices/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, action }),
    });

    if (res.ok) {
      toast(`Bulk ${action} completed on ${selectedIds.length} invoices`);
      setSelectedIds([]);
      void fetchInvoices();
      return;
    }

    if (!opts?.silentError) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || `Bulk ${action} failed`, "error");
    }
  }

  async function handleExport() {
    const res = await fetch("/api/invoices/export");
    if (!res.ok) {
      toast("Export failed (you may lack permission)", "error");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV export downloaded");
  }

  async function confirmBulkDelete() {
    setConfirmDelete(false);
    await handleBulkAction("delete", { silentError: true });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Invoices Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
            {total} total invoices
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            Export CSV
          </Button>
          <Link href="/dashboard/invoices/new">
            <Button size="sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search Invoices by ID or client..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="focus-ring w-80 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-sm dark:text-white dark:placeholder:text-slate-500"
        />
        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-full border transition-all",
                status === f.value
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 font-bold dark:text-emerald-400 dark:border-emerald-500/30"
                  : "bg-[var(--surface-elevated)] text-slate-600 border-[var(--border)] hover:bg-[var(--surface)] dark:text-slate-400 dark:text-slate-500"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200/50 bg-emerald-50/80 px-4 py-3 backdrop-blur-sm dark:border-emerald-800/30 dark:bg-emerald-950/30">
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {selectedIds.length} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkAction("mark_sent")}
          >
            Mark as Sent
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkAction("mark_paid")}
          >
            Mark as Paid
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="glass animate-pulse rounded-2xl p-4"
            >
              <div className="flex gap-4">
                <div className="h-4 w-4 rounded bg-[var(--surface-elevated)]" />
                <div className="h-4 w-32 rounded bg-[var(--surface-elevated)]" />
                <div className="h-4 w-24 rounded bg-[var(--surface-elevated)]" />
                <div className="h-4 w-16 rounded bg-[var(--surface-elevated)]" />
              </div>
            </div>
          ))}
        </div>
      ) : !loading && invoices.length === 0 ? (
        <div />
      ) : (
        <InvoiceTable
          invoices={invoices}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          emptyTitle={search || status ? "No matches" : "No invoices yet"}
          emptyDescription={
            search || status
              ? "Try removing filters or adjusting your search."
              : "Create your first invoice to start tracking payments and balances."
          }
          emptyCtaLabel={search || status ? undefined : "+ New Invoice"}
          emptyCtaHref={search || status ? undefined : "/dashboard/invoices/new"}
        />
      )}

      {total > 15 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Page {page}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={invoices.length < 15}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogHeader>
          <DialogTitle>Delete {selectedIds.length} invoice{selectedIds.length === 1 ? "" : "s"}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
          This is a soft delete. Invoices are hidden, but their history stays in
          the activity log. You can re-issue from the records you keep.
        </p>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmBulkDelete}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge, invoiceStatusVariant } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  balancePaid: number;
  taxRate: number;
  discount: number;
  currency: string;
  issuedDate: string;
  dueDate: string;
  notes?: string | null;
  customer: { name: string; email: string; company?: string | null; address?: string | null };
  items: { id: string; description: string; quantity: number; unitPrice: number; amount: number }[];
  user: { name: string };
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/invoices/${params.id}`)
      .then((r) => r.json())
      .then(setInvoice);
  }, [params.id]);

  async function handleMarkAsPaid() {
    const res = await fetch(`/api/invoices/${params.id}/pay`, { method: "POST" });
    if (res.ok) {
      toast("Invoice marked as paid");
      const updated = await res.json();
      setInvoice((prev) => (prev ? { ...prev, ...updated } : prev));
    }
  }

  async function handleUpdateStatus(status: string) {
    const res = await fetch(`/api/invoices/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast(`Invoice status updated to ${status}`);
      const updated = await res.json();
      setInvoice((prev) => (prev ? { ...prev, ...updated } : prev));
    }
  }

  async function handleShare() {
    const res = await fetch(`/api/invoices/${params.id}/share`, { method: "POST" });
    if (!res.ok) {
      toast("Could not generate share link", "error");
      return;
    }
    const data = await res.json();
    setShareUrl(data.shareUrl);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(data.shareUrl);
        toast("Share link copied to clipboard");
      } catch {
        toast("Share link generated (copy manually below)");
      }
    } else {
      toast("Share link generated");
    }
  }

  if (!invoice) {
    return (
      <div className="space-y-4">
        <div className="glass animate-pulse rounded-2xl p-8">
          <div className="h-6 w-48 rounded bg-[var(--surface-elevated)]" />
          <div className="mt-4 h-4 w-32 rounded bg-[var(--surface-elevated)]" />
        </div>
      </div>
    );
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (invoice.taxRate / 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            &larr; Back
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {invoice.invoiceNumber}
          </h1>
          <Badge variant={invoiceStatusVariant(invoice.status)} className="mt-2">
            {invoice.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          {invoice.status === "DRAFT" && (
            <Button variant="secondary" onClick={() => handleUpdateStatus("SENT")}>
              Mark as Sent
            </Button>
          )}
          {invoice.status !== "PAID" && (
            <Button onClick={handleMarkAsPaid}>Mark as Paid</Button>
          )}
          <Button variant="secondary" onClick={handleShare}>
            Share Public Link
          </Button>
        </div>
      </div>

      {shareUrl && (
        <div className="glass rounded-2xl p-4 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Public Share Link
          </p>
          <p className="break-all text-xs text-slate-700 dark:text-slate-300">
            {shareUrl}
          </p>
          <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
            Anyone with this link can view and pay this invoice. Rotating the link invalidates any previously shared URLs.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-500">
              Line Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50">
                    <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Description
                    </th>
                    <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Qty
                    </th>
                    <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Price
                    </th>
                    <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50 last:border-0 dark:border-slate-700/30">
                      <td className="py-3 text-sm text-slate-900 dark:text-white">
                        {item.description}
                      </td>
                      <td className="py-3 text-right text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-right text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4 space-y-2 dark:border-slate-700/50">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Subtotal</span>
                <span className="text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    Tax ({invoice.taxRate}%)
                  </span>
                  <span className="text-slate-900 dark:text-white">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Discount</span>
                  <span className="text-slate-900 dark:text-white">
                    -{formatCurrency(invoice.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold border-t border-slate-100 pt-2 dark:border-slate-700/50">
                <span className="text-slate-900 dark:text-white">Total</span>
                <span className="text-slate-900 dark:text-white">{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.balancePaid > 0 && invoice.balancePaid < invoice.total && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Balance Paid</span>
                  <span className="text-emerald-600 font-semibold dark:text-emerald-400">
                    {formatCurrency(invoice.balancePaid)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 shadow-sm">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-500">
              Customer
            </h2>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {invoice.customer.name}
            </p>
            {invoice.customer.company && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {invoice.customer.company}
              </p>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {invoice.customer.email}
            </p>
            {invoice.customer.address && (
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                {invoice.customer.address}
              </p>
            )}
          </div>

          <div className="glass rounded-2xl p-6 shadow-sm">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-500">
              Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Issue Date</p>
                <p className="text-sm text-slate-900 dark:text-white">{formatDate(invoice.issuedDate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Due Date</p>
                <p className="text-sm text-slate-900 dark:text-white">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Created By</p>
                <p className="text-sm text-slate-900 dark:text-white">{invoice.user.name}</p>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="glass rounded-2xl p-6 shadow-sm">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Notes
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
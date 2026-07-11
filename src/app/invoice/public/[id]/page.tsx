"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Badge, invoiceStatusVariant } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  balancePaid: number;
  taxRate: number;
  discount: number;
  issuedDate: string;
  dueDate: string;
  notes?: string | null;
  customer: { name: string; company?: string | null; email: string; address?: string | null };
  items: { id: string; description: string; quantity: number; unitPrice: number; amount: number }[];
}

export default function PublicInvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!token) return;
    const invoiceId = params.id;
    if (typeof invoiceId !== "string") return;
    let cancelled = false;
    fetch(`/api/public/invoices/${invoiceId}?token=${encodeURIComponent(token)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setInvoice(data);
      })
      .catch(() => {
        if (!cancelled) setError("Invoice not found or link has been revoked.");
      });
    return () => {
      cancelled = true;
    };
  }, [params.id, token]);

  async function handlePay() {
    if (!invoice) return;
    setPaying(true);
    const res = await fetch(
      `/api/public/invoices/${invoice.id}/pay?token=${encodeURIComponent(token)}`,
      { method: "POST" }
    );
    if (res.ok) {
      setPaid(true);
      setInvoice((prev) =>
        prev ? { ...prev, status: "PAID", balancePaid: prev.total } : prev
      );
    } else {
      setError("Could not record payment. Please retry.");
    }
    setPaying(false);
  }

  function handlePrint() {
    window.print();
  }

  const missingToken = !token;
  const displayError = missingToken
    ? "This share link is missing a token. Please request a fresh link from the invoice sender."
    : error;

  if (displayError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Invoice Not Found
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
            {displayError}
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (invoice.taxRate / 100);
  const balanceDue = invoice.total - invoice.balancePaid;

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-8">
      <div className="no-print mx-auto mb-8 max-w-4xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold text-[var(--foreground)]">
          InvoiceLoop · Customer Portal
        </h1>
        <button
          onClick={handlePrint}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-elevated)]"
        >
          Download / Print PDF
        </button>
      </div>

      <div className="mx-auto max-w-4xl grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Invoice */}
        <div className="print-container rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 lg:col-span-2">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">INVOICE</h2>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              {invoice.invoiceNumber}
            </p>
            <Badge variant={invoiceStatusVariant(invoice.status)} className="mt-2">
              {invoice.status}
            </Badge>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-[var(--foreground-muted)]">
                Bill To
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                {invoice.customer.name}
              </p>
              {invoice.customer.company && (
                <p className="text-xs text-[var(--foreground-muted)]">
                  {invoice.customer.company}
                </p>
              )}
              <p className="text-xs text-[var(--foreground-muted)]">
                {invoice.customer.email}
              </p>
              {invoice.customer.address && (
                <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                  {invoice.customer.address}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-xs text-[var(--foreground-muted)]">Issue Date</p>
                <p className="text-sm text-[var(--foreground)]">{formatDate(invoice.issuedDate)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--foreground-muted)]">Due Date</p>
                <p className="text-sm text-[var(--foreground)]">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
            <thead>
              <tr className="border-b-2 border-[var(--border)]">
                <th className="pb-3 text-left text-xs font-medium uppercase text-[var(--foreground-muted)]">
                  Description
                </th>
                <th className="pb-3 text-right text-xs font-medium uppercase text-[var(--foreground-muted)]">
                  Qty
                </th>
                <th className="pb-3 text-right text-xs font-medium uppercase text-[var(--foreground-muted)]">
                  Price
                </th>
                <th className="pb-3 text-right text-xs font-medium uppercase text-[var(--foreground-muted)]">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)]">
                  <td className="py-3 text-[var(--foreground)]">{item.description}</td>
                  <td className="py-3 text-right text-[var(--foreground-secondary)]">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-[var(--foreground-secondary)]">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 text-right font-medium text-[var(--foreground)]">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="mt-6 space-y-2 border-t-2 border-[var(--border)] pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--foreground-secondary)]">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--foreground-secondary)]">
                  Tax ({invoice.taxRate}%)
                </span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--foreground-secondary)]">Discount</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--border)] pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6 border-t border-[var(--border)] pt-4">
              <p className="text-xs font-medium uppercase text-[var(--foreground-muted)]">
                Notes
              </p>
              <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>

        {/* Payment Panel */}
        <div className="no-print">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h3 className="mb-4 text-sm font-medium text-[var(--foreground-secondary)]">
              Payment
            </h3>

            {invoice.status === "PAID" || paid ? (
              <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-950">
                <Badge variant="paid">PAID</Badge>
                <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
                  This invoice has been settled
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-[var(--surface-elevated)] p-4">
                  <p className="text-xs text-[var(--foreground-muted)]">Balance Due</p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {formatCurrency(balanceDue)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--foreground-secondary)]">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[var(--foreground-secondary)]">
                        Expiry
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[var(--foreground-secondary)]">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="focus-ring w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {paying ? "Securing transaction..." : `Pay ${formatCurrency(balanceDue)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

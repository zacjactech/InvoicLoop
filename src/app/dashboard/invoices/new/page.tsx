"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { InvoicePreview } from "@/components/features/invoice-preview";
import { formatCurrency, generateInvoiceNumber } from "@/lib/utils";
import { calculateInvoiceTotals } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  company?: string | null;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

function buildDefaultForm() {
  const today = new Date().toISOString().split("T")[0];
  const due = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
  return {
    customerId: "",
    invoiceNumber: "",
    issuedDate: today,
    dueDate: due,
    taxRate: 10,
    discount: 0,
    notes: "",
  };
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState(buildDefaultForm);
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    let active = true;
    fetch("/api/customers?limit=100")
      .then((r) => r.json())
      .then((data) => {
        if (active) {
          setCustomers(data.customers || []);
          setForm((f) =>
            f.invoiceNumber ? f : { ...f, invoiceNumber: generateInvoiceNumber() }
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), description: "", quantity: 1, unitPrice: 0 },
    ]);
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function removeItem(id: string) {
    if (items.length > 1) setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const { subtotal, taxAmount, total } = calculateInvoiceTotals(
    items,
    form.taxRate,
    form.discount
  );

  async function handleSubmit() {
    setSubmitError(null);
    setFieldErrors({});
    if (!form.customerId) {
      toast("Please select a customer", "error");
      return;
    }
    const validItems = items.filter((i) => i.description && i.unitPrice > 0);
    if (validItems.length === 0) {
      toast("Please add at least one line item", "error");
      return;
    }
    setIsSubmitting(true);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        items: validItems.map(({ description, quantity, unitPrice }) => ({
          description,
          quantity,
          unitPrice,
        })),
      }),
    });
    if (res.ok) {
      const invoice = await res.json();
      toast("Invoice created successfully");
      router.push(`/dashboard/invoices/${invoice.id}`);
      return;
    }
    const data = await res.json().catch(() => ({}));
    const errorMessage: string =
      typeof data.error === "string" ? data.error : "Failed to create invoice";
    setSubmitError(errorMessage);
    if (data?.details?.fieldErrors) {
      const next: Record<string, string> = {};
      for (const [key, value] of Object.entries(data.details.fieldErrors)) {
        const first = Array.isArray(value) ? value[0] : undefined;
        if (first) next[key] = String(first);
      }
      setFieldErrors(next);
    }
    toast(errorMessage, "error");
    setIsSubmitting(false);
  }

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
            Split-Screen Creator
          </h1>
        </div>
        <Button onClick={handleSubmit} loading={isSubmitting}>
          {isSubmitting ? "Generating invoice entries..." : "Publish & Send Invoice"}
        </Button>
      </div>

      {submitError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur-sm dark:border-red-800/60 dark:bg-red-950/80 dark:text-red-400"
        >
          <p className="font-medium">{submitError}</p>
          {Object.keys(fieldErrors).length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              {Object.entries(fieldErrors).map(([field, message]) => (
                <li key={field}>
                  <span className="font-mono">{field}</span>: {message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3 dark:text-slate-400 dark:border-slate-700/50">
              Invoice Details
            </h2>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Invoice Number"
                  value={form.invoiceNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, invoiceNumber: e.target.value }))
                  }
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white">
                    Customer
                  </label>
                  <select
                    value={form.customerId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, customerId: e.target.value }))
                    }
                    className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-slate-900 backdrop-blur-sm dark:text-white"
                  >
                    <option value="">Select customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Issue Date"
                  type="date"
                  value={form.issuedDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, issuedDate: e.target.value }))
                  }
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  min={0}
                  max={100}
                  value={form.taxRate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, taxRate: Number(e.target.value) }))
                  }
                />
                <Input
                  label="Discount ($)"
                  type="number"
                  min={0}
                  value={form.discount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discount: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-700/50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Line Items
              </span>
              <button
                onClick={addItem}
                className="text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400 flex items-center gap-1"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Row
              </button>
            </div>
            <div className="space-y-3 pt-3">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    className="focus-ring flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-sm dark:text-white dark:placeholder:text-zinc-400"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      className="focus-ring w-16 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-sm text-slate-900 text-center backdrop-blur-sm dark:text-white"
                    />
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                      className="focus-ring w-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-sm text-slate-900 text-right backdrop-blur-sm dark:text-white"
                    />
                    <span className="w-24 text-right text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-xl border border-[var(--border)] p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <InvoicePreview
          invoiceNumber={form.invoiceNumber}
          issuedDate={form.issuedDate}
          dueDate={form.dueDate}
          customerId={form.customerId}
          customers={customers}
          items={items}
          subtotal={subtotal}
          taxRate={form.taxRate}
          taxAmount={taxAmount}
          discount={form.discount}
          total={total}
        />
      </div>
    </div>
  );
}
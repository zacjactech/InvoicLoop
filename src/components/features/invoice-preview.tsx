"use client";

import { formatCurrency } from "@/lib/utils";

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

interface InvoicePreviewProps {
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  customerId: string;
  customers: Customer[];
  items: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
}

export function InvoicePreview({
  invoiceNumber,
  issuedDate,
  dueDate,
  customerId,
  customers,
  items,
  subtotal,
  taxRate,
  taxAmount,
  discount,
  total,
}: InvoicePreviewProps) {
  const customer = customers.find((c) => c.id === customerId);

  return (
    <div className="glass-strong rounded-2xl p-4 text-zinc-950 lg:sticky lg:top-8 lg:p-8 print-container sm:p-6">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          INVOICE
        </h3>
        <p className="text-sm font-mono text-emerald-600 font-bold dark:text-emerald-500">
          {invoiceNumber}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</p>
          <p className="text-zinc-800 dark:text-zinc-200 mt-0.5">{issuedDate}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Due Date</p>
          <p className="text-zinc-800 dark:text-zinc-200 mt-0.5">{dueDate}</p>
        </div>
      </div>

      <div className="mb-6 border-y border-zinc-100 dark:border-zinc-700/50 py-4">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Billed To</p>
        <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {customer?.name || "Select a customer"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px] text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700/50">
            <th className="pb-2 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Item
            </th>
            <th className="pb-2 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Qty
            </th>
            <th className="pb-2 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Price
            </th>
            <th className="pb-2 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-700/50">
              <td className="py-2.5 text-zinc-800 dark:text-zinc-200 font-medium">
                {item.description || "No description"}
              </td>
              <td className="py-2.5 text-right text-zinc-500 dark:text-zinc-400">
                {item.quantity}
              </td>
              <td className="py-2.5 text-right text-zinc-500 dark:text-zinc-400">
                {formatCurrency(item.unitPrice)}
              </td>
              <td className="py-2.5 text-right font-semibold text-zinc-800 dark:text-zinc-200">
                {formatCurrency(item.quantity * item.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="mt-4 space-y-2 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatCurrency(subtotal)}</span>
        </div>
        {taxRate > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Tax ({taxRate}%)</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatCurrency(taxAmount)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Discount</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-semibold border-t border-zinc-100 dark:border-zinc-700/50 pt-2">
          <span className="text-zinc-900 dark:text-white">Total</span>
          <span className="text-emerald-600 font-bold dark:text-emerald-500">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
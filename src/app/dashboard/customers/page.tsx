"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import type React from "react";

interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  address?: string | null;
  _count: { invoices: number };
}

interface DraftForm {
  name: string;
  email: string;
  company: string;
  phone: string;
  address: string;
}

const blankForm: DraftForm = {
  name: "",
  email: "",
  company: "",
  phone: "",
  address: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DraftForm>(blankForm);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCustomers = useCallback(async (q: string) => {
    const res = await fetch(`/api/customers?search=${encodeURIComponent(q)}&limit=50`);
    if (!res.ok) return;
    const data = await res.json();
    setCustomers(data.customers || []);
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      void fetchCustomers(search);
    }, 200);
    return () => clearTimeout(handle);
  }, [search, fetchCustomers]);

  function openCreate() {
    setEditingId(null);
    setForm(blankForm);
    setShowForm(true);
  }

  function openEdit(c: Customer) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      email: c.email,
      company: c.company ?? "",
      phone: c.phone ?? "",
      address: c.address ?? "",
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (editingId) {
      const res = await fetch(`/api/customers/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast("Customer updated");
        setShowForm(false);
        await fetchCustomers(search);
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || "Failed to update customer", "error");
      }
      return;
    }

    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast("Customer created successfully");
      setShowForm(false);
      setForm(blankForm);
      await fetchCustomers(search);
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Failed to create customer", "error");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Customer deleted");
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      toast(
        data.error === "Forbidden: admin only"
          ? "Only admins can delete customers"
          : data.error || "Failed to delete customer",
        "error"
      );
    }
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customers Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
            {customers.length} customer{customers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Client
        </Button>
      </div>

      <input
        type="text"
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="focus-ring w-80 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-sm dark:text-white dark:placeholder:text-slate-500"
      />

      {customers.length === 0 ? (
        <EmptyState
          title={search ? "No matching customers" : "No customers yet"}
          description={
            search
              ? "Try a different name, email, or company."
              : "Add your first customer to start invoicing them."
          }
          cta={search ? undefined : { label: "+ Add Customer", href: "#add-customer" }}
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
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="glass rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {customer.name}
                  </h3>
                  {customer.company && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {customer.company}
                    </p>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                  Active
                </span>
              </div>
              <div className="space-y-1 border-t border-slate-100 pt-3 dark:border-slate-700/50">
                <p className="text-xs text-slate-500 flex items-center gap-2 dark:text-slate-400 dark:text-slate-500">
                  <svg className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {customer.email}
                </p>
                {customer.phone && (
                  <p className="text-xs text-slate-400 flex items-center gap-2 dark:text-slate-500">
                    <svg className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    {customer.phone}
                  </p>
                )}
              </div>
              <div className="flex gap-1 pt-1">
                <button
                  onClick={() => openEdit(customer)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-[var(--surface-elevated)] hover:text-slate-900 dark:hover:text-white"
                  aria-label="Edit customer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                </button>
                <button
                  onClick={() => setConfirmDelete(customer.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                  aria-label="Delete customer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onClose={() => setShowForm(false)}>
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
          />
          <Input
            label="Company"
            value={form.company}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, company: e.target.value }))
            }
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, phone: e.target.value }))
            }
          />
          <Input
            label="Address"
            value={form.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
          />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{editingId ? "Save" : "Create"}</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogHeader>
          <DialogTitle>Delete this customer?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
          This is a soft delete. Invoices stay in the activity log, but the
          customer record is hidden from the directory.
        </p>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => confirmDelete && handleDelete(confirmDelete)}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
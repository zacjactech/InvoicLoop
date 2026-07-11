"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Sign up failed");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-strong rounded-2xl p-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white shadow-sm"
              style={{ transform: "rotate(-12deg)" }}
            >
              I
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              InvoiceLoop
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
            The first account becomes the workspace administrator.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: "name", label: "Full name", type: "text", placeholder: "Jane Doe", key: "name" as const },
            { id: "email", label: "Work email", type: "email", placeholder: "you@company.com", key: "email" as const },
            { id: "password", label: "Password", type: "password", placeholder: "At least 8 characters", key: "password" as const },
            { id: "company", label: "Company", type: "text", placeholder: "Acme Studios", key: "company" as const },
          ].map(({ id, label, type, placeholder, key }) => (
            <div key={id}>
              <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-slate-900 dark:text-white"
              >
                {label} {key === "company" && <span className="text-slate-400 dark:text-slate-500">(optional)</span>}
              </label>
              <input
                id={id}
                type={type}
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                required={key !== "company"}
                minLength={key === "password" ? 8 : undefined}
                className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-sm dark:text-white dark:placeholder:text-slate-500"
                placeholder={placeholder}
              />
              {key === "password" && (
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Use at least 8 characters; mix of letters and numbers is recommended.
                </p>
              )}
            </div>
          ))}

          {error && (
            <div className="rounded-xl border border-red-200/60 bg-red-50/80 px-3 py-2.5 text-sm text-red-700 backdrop-blur-sm dark:border-red-800/60 dark:bg-red-950/80 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="focus-ring w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-80 shadow-sm shadow-emerald-600/10"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
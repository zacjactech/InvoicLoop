"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed");
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
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-900 dark:text-white"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-sm dark:text-white dark:placeholder:text-slate-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-900 dark:text-white"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-sm dark:text-white dark:placeholder:text-slate-500"
              placeholder="Enter your password"
            />
          </div>

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
            {isLoading ? "Verifying credentials..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Need an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
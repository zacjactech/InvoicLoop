"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "sent";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not start password reset");
        setIsLoading(false);
        return;
      }

      setStatus("sent");
      setIsLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md px-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
            We&apos;ll email you a link to choose a new password.
          </p>
        </div>

        {status === "sent" ? (
          <div className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
            <p className="font-medium">Check your inbox.</p>
            <p>
              If an account exists for{" "}
              <span className="font-mono">{email}</span>, we&apos;ve sent password
              reset instructions. The link expires in one hour.
            </p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
              In development, the link is also printed to the server console.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="focus-ring w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isLoading ? "Sending..." : "Email me a reset link"}
            </button>

            <p className="text-center text-sm text-[var(--foreground-secondary)]">
              <Link
                href="/login"
                className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

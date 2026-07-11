import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-6 text-center">
      <div className="glass-strong rounded-3xl p-10 max-w-md w-full shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white shadow-lg shadow-emerald-600/20" style={{ transform: "rotate(-12deg)" }}>
          I
        </div>

        <h1 className="text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
          404
        </h1>
        <p className="mt-3 text-lg font-medium text-slate-600 dark:text-slate-300">
          Page not found
        </p>
        <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-600/10 transition-colors hover:bg-emerald-500"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-[var(--surface-elevated)] dark:text-slate-300"
          >
            Sign In
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-400 dark:text-slate-500">
          InvoiceLoop · Billing & Invoicing
        </p>
      </div>
    </div>
  );
}

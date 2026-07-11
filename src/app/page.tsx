import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="shell flex flex-col items-center gap-8 rounded-[32px] p-12 max-w-lg w-full">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white shadow-sm"
              style={{ transform: "rotate(-12deg)" }}
            >
              I
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              InvoiceLoop
            </h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Billing & invoicing for modern merchants
          </span>
          <p className="max-w-md text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
            Track balances, generate professional invoices, and send interactive
            payment portals to your customers in one place.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-3">
            <Link
              href="/signup"
              className="focus-ring inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500 shadow-sm shadow-emerald-600/10"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="focus-ring inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-[var(--surface)] backdrop-blur-sm dark:text-white"
            >
              Sign In
            </Link>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            The first account you create becomes the workspace admin.
          </p>
        </div>
      </div>
    </main>
  );
}
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] p-12 text-center">
      <h1 className="text-4xl font-bold text-[var(--foreground)]">404</h1>
      <p className="text-lg text-[var(--foreground-secondary)]">
        This page could not be found.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Go Home
      </Link>
    </div>
  );
}

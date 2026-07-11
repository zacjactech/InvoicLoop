"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] p-12 text-center">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Something went wrong
      </h1>
      <p className="max-w-md text-sm text-[var(--foreground-secondary)]">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Try Again
      </button>
    </div>
  );
}

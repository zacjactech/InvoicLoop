"use client";

import SuspenseBoundary from "./client";
import { Suspense } from "react";

// The page is wrapped in <Suspense> so useSearchParams works under
// Next 16's static rendering rule. The actual form lives in `client.tsx`.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-[var(--foreground-secondary)]">Loading...</div>}>
      <SuspenseBoundary />
    </Suspense>
  );
}

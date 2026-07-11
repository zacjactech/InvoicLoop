"use client";

import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  cta?: { label: string; href: string };
  icon?: React.ReactNode;
}

const defaultIcon = (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
    />
  </svg>
);

export function EmptyState({ title, description, cta, icon = defaultIcon }: EmptyStateProps) {
  return (
    <div className="glass rounded-2xl px-6 py-16 text-center shadow-sm">
      <div className="mx-auto mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
        {description}
      </p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500 shadow-sm shadow-emerald-600/10"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
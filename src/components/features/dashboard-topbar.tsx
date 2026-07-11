"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  label: string;
  href: string;
  meta?: string;
}

export function DashboardTopBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (open && (query.trim() || suggestions.length === 0)) {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      fetch(`/api/search${params.toString() ? `?${params}` : ""}`)
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((data) => setSuggestions(data.results || []))
        .catch(() => setSuggestions([]));
    }
  }, [open, query, suggestions.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const editable = (e.target as HTMLElement | null)?.isContentEditable;
      const inField = tag === "INPUT" || tag === "TEXTAREA" || editable;
      if (inField) return;
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        document.getElementById("dashboard-search")?.focus();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      } else if (
        e.key.toLowerCase() === "c" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        router.push("/dashboard/invoices/new");
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, router]);

  function navigate(s: Suggestion) {
    setOpen(false);
    setQuery("");
    router.push(s.href);
  }

  return (
    <header className="no-print sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/80 px-6 backdrop-blur-md">
      <div className="relative flex-1 max-w-md">
        <div
          onClick={() => document.getElementById("dashboard-search")?.focus()}
          className={cn(
            "flex items-center justify-between h-10 px-4 border rounded-xl text-slate-400 text-sm w-full gap-6 select-none transition-all shadow-sm cursor-text",
            "bg-[var(--surface-elevated)] hover:bg-[var(--surface)] border-[var(--border)]"
          )}
        >
          <div className="flex items-center gap-2.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m2.85-5.4a8.25 8.25 0 11-16.5 0 8.25 8.25 0 0116.5 0z" />
            </svg>
            <span className="text-slate-400 dark:text-slate-500">Quick Search...</span>
          </div>
          <kbd className="text-[10px] bg-slate-50 border border-[var(--border)] text-slate-400 rounded px-1.5 py-0.5 select-none dark:text-slate-500">
            Cmd K
          </kbd>
        </div>

        <input
          id="dashboard-search"
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions[0]) {
              navigate(suggestions[0]);
            }
          }}
          placeholder=""
          className="absolute inset-0 w-full h-full opacity-0 cursor-text"
          autoComplete="off"
        />

        {open && (
          <div className="absolute left-0 right-0 top-full mt-1">
            <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg backdrop-blur-md">
              {suggestions.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  {query.trim() ? "No matches." : "Type to search invoices and customers."}
                </div>
              ) : (
                <ul className="max-h-64 overflow-y-auto py-1">
                  {suggestions.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onMouseDown={() => navigate(s)}
                        className={cn(
                          "flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 hover:bg-[var(--surface-elevated)] dark:text-slate-200"
                        )}
                      >
                        <span className="truncate">{s.label}</span>
                        {s.meta && (
                          <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                            {s.meta}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
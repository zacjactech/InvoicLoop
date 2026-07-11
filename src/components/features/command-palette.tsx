"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Command = {
  id: string;
  category: "Navigation" | "Actions" | "Settings";
  label: string;
  shortcut?: string;
  keywords?: string[];
  action: () => void;
};

function buildCommands(
  router: ReturnType<typeof useRouter>,
  toggleTheme: () => void
): Command[] {
  return [
    { id: "nav-dashboard", category: "Navigation", label: "Go to Dashboard", keywords: ["home"], action: () => router.push("/dashboard") },
    { id: "nav-invoices", category: "Navigation", label: "Go to Invoices", keywords: ["list"], action: () => router.push("/dashboard/invoices") },
    { id: "nav-customers", category: "Navigation", label: "Go to Customers", keywords: ["clients"], action: () => router.push("/dashboard/customers") },
    { id: "nav-activity", category: "Navigation", label: "Go to Activity", keywords: ["log", "audit"], action: () => router.push("/dashboard/activity") },
    { id: "action-new-invoice", category: "Actions", label: "New Invoice", shortcut: "N", keywords: ["create"], action: () => router.push("/dashboard/invoices/new") },
    { id: "action-new-customer", category: "Actions", label: "New Customer", keywords: ["create", "client"], action: () => router.push("/dashboard/customers") },
    { id: "action-export", category: "Actions", label: "Export CSV on Invoices page", keywords: ["download"], action: () => router.push("/dashboard/invoices") },
    { id: "setting-theme", category: "Settings", label: "Toggle Dark Mode", keywords: ["theme", "appearance"], action: () => toggleTheme() },
    {
      id: "setting-logout",
      category: "Settings",
      label: "Sign Out",
      keywords: ["logout"],
      action: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      },
    },
  ];
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    try {
      localStorage.setItem(
        "theme",
        root.classList.contains("dark") ? "dark" : "light"
      );
    } catch {
      // ignore
    }
  };

  const commands = useMemo(() => buildCommands(router, toggleTheme), [router]);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      [c.label, c.category, ...(c.keywords ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    queueMicrotask(() => inputRef.current?.focus());
  }, []);

  function handleKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) =>
        filtered.length === 0 ? 0 : (i + 1) % filtered.length
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) {
        cmd.action();
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl backdrop-blur-md"
        onKeyDown={handleKey}
      >
        <div className="flex items-center h-12 px-4 border-b border-[var(--border)] gap-3">
          <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m2.85-5.4a8.25 8.25 0 11-16.5 0 8.25 8.25 0 0116.5 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Type a command or directory..."
            className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          />
          <kbd
            className="rounded border border-[var(--border)] bg-[var(--surface-elevated)] px-1.5 py-0.5 text-[10px] font-mono text-slate-400 backdrop-blur-sm dark:text-slate-500 select-none cursor-pointer"
            onClick={onClose}
          >
            Esc
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
              No matches.
            </div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => {
                cmd.action();
                onClose();
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors",
                i === activeIndex
                  ? "bg-[var(--surface-elevated)] text-slate-900 dark:text-white"
                  : "text-slate-600 hover:bg-[var(--surface-elevated)] dark:text-slate-300"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                    "bg-[var(--surface-elevated)] text-slate-500 dark:text-slate-400 dark:text-slate-500"
                  )}
                >
                  {cmd.category}
                </span>
                <span>{cmd.label}</span>
              </div>
              {cmd.shortcut && (
                <kbd className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
        <div className="border-t border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-xs text-slate-400 backdrop-blur-sm dark:text-slate-500">
          <span>↑↓ navigate</span> · <span>↵ select</span> · <span>esc close</span>
        </div>
      </div>
    </div>
  );
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA";
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "/" && !inField) {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;
  return <PaletteBody onClose={() => setOpen(false)} />;
}
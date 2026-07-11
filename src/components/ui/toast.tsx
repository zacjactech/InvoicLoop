"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, createContext, useContext, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_MS = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    const handle = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, TOAST_MS);
    timers.current.set(id, handle);
  }, []);

  useEffect(() => {
    const current = timers.current;
    return () => {
      current.forEach((handle) => clearTimeout(handle));
      current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={cn(
              "toast-slide-in rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md",
              t.type === "success" &&
                "border-emerald-200/60 bg-emerald-50/90 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/90 dark:text-emerald-400",
              t.type === "error" &&
                "border-red-200/60 bg-red-50/90 text-red-700 dark:border-red-800/60 dark:bg-red-950/90 dark:text-red-400",
              t.type === "info" &&
                "border-blue-200/60 bg-blue-50/90 text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/90 dark:text-blue-400"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
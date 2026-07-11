import { cn } from "@/lib/utils";

type BadgeVariant = "paid" | "sent" | "overdue" | "draft" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  paid: "bg-emerald-50 text-emerald-700 border border-emerald-100/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  sent: "bg-blue-50 text-blue-700 border border-blue-100/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  overdue: "bg-red-50 text-red-700 border border-red-100/20 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  draft: "bg-slate-100 text-slate-600 border border-slate-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  default: "bg-[var(--surface-elevated)] text-slate-600 border border-[var(--border)] dark:text-slate-400 dark:text-slate-500",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function invoiceStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "PAID":
      return "paid";
    case "SENT":
      return "sent";
    case "OVERDUE":
      return "overdue";
    case "DRAFT":
      return "draft";
    default:
      return "default";
  }
}
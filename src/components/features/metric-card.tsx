import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  changeType = "neutral",
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 shadow-sm",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
      {change && (
        <p
          className={cn(
            "mt-2 text-xs font-semibold",
            changeType === "positive" && "text-emerald-600 dark:text-emerald-400",
            changeType === "negative" && "text-amber-600 dark:text-amber-400",
            changeType === "neutral" && "text-slate-400 dark:text-slate-500"
          )}
        >
          {change}
        </p>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";

interface ChartDataPoint {
  label: string;
  value: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  className?: string;
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  return (
    <div className={cn("glass rounded-2xl p-6 shadow-sm", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Invoiced Revenue
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">Last 6 Months</span>
      </div>

      <div className="flex items-end justify-between relative mt-4 pt-4 select-none" style={{ height: 176 }}>
        {data.map((point, i) => {
          const hPct = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
          const isHovered = hoverIdx === i;
          const isLast = i === data.length - 1;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center group relative"
              style={{ height: "100%", justifyContent: "flex-end" }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              {isHovered && (
                <span className="absolute -top-4 bg-zinc-950 px-2 py-0.5 rounded text-white text-[10px] font-mono border border-zinc-800 whitespace-nowrap z-10 dark:bg-white dark:text-zinc-900 dark:border-zinc-200">
                  {formatCurrency(point.value)}
                </span>
              )}
              <div
                className={cn(
                  "w-12 rounded-t-xl transition-all",
                  isHovered
                    ? "bg-emerald-600"
                    : isLast
                    ? "bg-emerald-600 shadow-[0_0_15px_rgba(5,150,105,0.2)]"
                    : "bg-emerald-600/20"
                )}
                style={{ height: `${hPct}%` }}
              />
              <p
                className={cn(
                  "text-[10px] mt-2 font-medium text-slate-400 dark:text-slate-500",
                  isLast && "text-emerald-600 font-bold dark:text-emerald-400"
                )}
              >
                {isLast ? `${point.label} (Now)` : point.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
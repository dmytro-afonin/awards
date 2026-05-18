"use client";

import { cn } from "@/lib/utils";

export function VoteProgress({
  voted,
  total,
  className,
  barClassName,
}: {
  voted: number;
  total: number;
  className?: string;
  barClassName?: string;
}) {
  const pct = total > 0 ? Math.round((voted / total) * 100) : 0;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">Your ballot</span>
        <span className="font-medium tabular-nums">
          {voted} / {total} categories
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full bg-emerald-600 transition-all duration-500",
            barClassName,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

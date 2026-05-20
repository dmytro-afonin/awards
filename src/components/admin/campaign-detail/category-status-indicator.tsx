"use client";

import {
  CATEGORY_STATUS_TONE,
  type CategoryRunStatus,
  categoryStatusLabel,
} from "@/lib/category-run";
import { cn } from "@/lib/utils";

export function CategoryStatusIndicator({
  status,
  size = "default",
  showDot = true,
  className,
}: {
  status: CategoryRunStatus;
  size?: "default" | "compact";
  showDot?: boolean;
  className?: string;
}) {
  const tone = CATEGORY_STATUS_TONE[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "compact"
          ? "px-2 py-0.5 text-[10px]"
          : "px-2.5 py-0.5 text-xs",
        tone.className,
        className,
      )}
    >
      {showDot ? (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", tone.dotClassName)}
          aria-hidden
        />
      ) : null}
      {categoryStatusLabel(status)}
    </span>
  );
}

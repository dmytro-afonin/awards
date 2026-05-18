"use client";

import type { Id } from "@cvx/_generated/dataModel";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LAYOUTS = [
  {
    id: "default",
    label: "Default",
    href: (id: string) => `/admin/campaigns/${id}`,
    description: "Hero header + control panel (chosen layout)",
  },
  {
    id: "a",
    label: "A",
    href: (id: string) => `/admin/campaigns/${id}/preview/a`,
    description: "Control panel only (legacy preview)",
  },
  {
    id: "b",
    label: "B",
    href: (id: string) => `/admin/campaigns/${id}/preview/b`,
    description: "Hero dashboard only (legacy preview)",
  },
] as const;

type LayoutCompareBarProps = {
  campaignId: Id<"campaigns">;
  active: "default" | "a" | "b";
  className?: string;
};

export function LayoutCompareBar({
  campaignId,
  active,
  className,
}: LayoutCompareBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2",
        className,
      )}
    >
      <Badge
        variant="outline"
        className="border-amber-500/40 text-amber-900 dark:text-amber-100"
      >
        Layout preview
      </Badge>
      <span className="text-xs text-muted-foreground">
        Default is the production layout; A and B are earlier explorations
      </span>
      <div className="ml-auto flex flex-wrap gap-1">
        {LAYOUTS.map((layout) => (
          <Link
            key={layout.id}
            href={layout.href(campaignId)}
            className={buttonVariants({
              variant: active === layout.id ? "default" : "outline",
              size: "sm",
            })}
            title={layout.description}
          >
            {layout.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

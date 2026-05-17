"use client";

import { Badge } from "@/components/ui/badge";
import { lifecycleBadgeClass, lifecycleLabel } from "@/lib/campaign-lifecycle";
import { cn } from "@/lib/utils";

export function CampaignLifecycleBadge({
  lifecycle,
  className,
}: {
  lifecycle: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", lifecycleBadgeClass(lifecycle), className)}
    >
      {lifecycleLabel(lifecycle)}
    </Badge>
  );
}

"use client";

import type { Id } from "@cvx/_generated/dataModel";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LayoutCompareBar } from "@/components/admin/campaign-detail/layout-compare-bar";
import { buttonVariants } from "@/components/ui/button";

export type PreviewVariant = "a" | "b";

export function PreviewPageHeader({
  campaignId,
  active,
  title,
}: {
  campaignId: Id<"campaigns">;
  active: PreviewVariant;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{title}</span>
        <Link
          href={`/admin/campaigns/${campaignId}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Default layout
        </Link>
      </div>
      <LayoutCompareBar campaignId={campaignId} active={active} />
    </div>
  );
}

export function usePreviewVariant(): PreviewVariant | null {
  const params = useParams();
  const raw = params.variant;
  const variant =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  if (variant === "a" || variant === "b") {
    return variant;
  }
  return null;
}

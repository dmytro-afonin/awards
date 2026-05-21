"use client";

import { RiExternalLinkLine, RiShareLine } from "@remixicon/react";
import Link from "next/link";
import { useCallback } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HoverShareViewActions({
  viewHref,
  className,
  iconClassName,
  hoverVisibleClassName = "group-hover:opacity-100 group-focus-within:opacity-100",
}: {
  viewHref: string;
  className?: string;
  iconClassName?: string;
  hoverVisibleClassName?: string;
}) {
  const { showShareMessage } = useAdmin();

  const handleShare = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const shareUrl = `${window.location.origin}${viewHref}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        showShareMessage("Link copied");
      } catch {
        showShareMessage("Could not copy link", "error");
      }
    },
    [viewHref, showShareMessage],
  );

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity",
        hoverVisibleClassName,
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn("size-7", iconClassName)}
        aria-label="Share link"
        onClick={(event) => void handleShare(event)}
      >
        <RiShareLine className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn("size-7", iconClassName)}
        nativeButton={false}
        aria-label="View public page"
        render={
          <Link
            href={viewHref}
            prefetch={false}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <RiExternalLinkLine className="size-3.5" />
      </Button>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CampaignTitleBlockProps = {
  name: string;
  slug: string;
  description?: string | null;
  dates?: ReactNode;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
  /** Invert text for hero banners */
  inverted?: boolean;
};

export function CampaignTitleBlock({
  name,
  slug,
  description,
  dates,
  size = "md",
  className,
  inverted = false,
}: CampaignTitleBlockProps) {
  const titleClass = cn(
    "font-semibold tracking-tight",
    size === "sm" && "text-lg",
    size === "md" && "text-2xl",
    size === "lg" && "text-xl",
    size === "hero" && "text-3xl font-bold md:text-4xl",
    inverted ? "text-white" : "text-foreground",
  );

  const metaClass = inverted ? "text-white/70" : "text-muted-foreground";

  return (
    <div className={cn("min-w-0", className)}>
      <h1 className={titleClass}>{name}</h1>
      <p className={cn("mt-0.5 text-xs", metaClass)}>
        <span className="sr-only">Slug: </span>
        {slug}
      </p>
      {description ? (
        <p
          className={cn(
            "mt-2 line-clamp-3",
            size === "hero" ? "text-sm md:text-base" : "text-sm",
            inverted ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
      {dates ? <p className={cn("mt-1 text-xs", metaClass)}>{dates}</p> : null}
    </div>
  );
}

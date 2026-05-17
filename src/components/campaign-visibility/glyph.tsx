"use client";

import {
  type CampaignVisibility,
  getCampaignVisibilityConfig,
} from "@/lib/campaign-visibility";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

export type CampaignVisibilityGlyphProps = {
  visibility: CampaignVisibility;
  size?: keyof typeof SIZE_CLASS;
  withSurface?: boolean;
  className?: string;
  iconClassName?: string;
};

export function CampaignVisibilityGlyph({
  visibility,
  size = "sm",
  withSurface = false,
  className,
  iconClassName,
}: CampaignVisibilityGlyphProps) {
  const config = getCampaignVisibilityConfig(visibility);
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        withSurface && "rounded-full p-1",
        withSurface && config.surfaceClassName,
        className,
      )}
    >
      <Icon
        className={cn(SIZE_CLASS[size], config.iconClassName, iconClassName)}
        aria-hidden
      />
    </span>
  );
}

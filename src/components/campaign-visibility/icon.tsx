"use client";

import { CampaignVisibilityGlyph } from "@/components/campaign-visibility/glyph";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type CampaignVisibility,
  getCampaignVisibilityConfig,
} from "@/lib/campaign-visibility";
import { cn } from "@/lib/utils";

export type CampaignVisibilityIconProps = {
  visibility: CampaignVisibility;
  size?: "sm" | "md" | "lg";
  withSurface?: boolean;
  className?: string;
  iconClassName?: string;
};

export function CampaignVisibilityIcon({
  visibility,
  size = "sm",
  withSurface = false,
  className,
  iconClassName,
}: CampaignVisibilityIconProps) {
  const config = getCampaignVisibilityConfig(visibility);

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          "inline-flex shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        aria-label={config.label}
      >
        <CampaignVisibilityGlyph
          visibility={visibility}
          size={size}
          withSurface={withSurface}
          iconClassName={iconClassName}
        />
      </TooltipTrigger>
      <TooltipContent>{config.description}</TooltipContent>
    </Tooltip>
  );
}

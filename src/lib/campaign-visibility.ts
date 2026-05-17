import type { Doc } from "@cvx/_generated/dataModel";
import {
  type RemixiconComponentType,
  RiGlobalLine,
  RiLockLine,
} from "@remixicon/react";

export type CampaignVisibility = Doc<"campaigns">["visibility"];

export type CampaignVisibilityConfig = {
  icon: RemixiconComponentType;
  iconClassName: string;
  surfaceClassName: string;
  label: string;
  description: string;
};

export const VISIBILITY_LABELS: Record<CampaignVisibility, string> = {
  public: "Public",
  private: "Private",
};

export const VISIBILITY_DESCRIPTION: Record<CampaignVisibility, string> = {
  private: "Only workspace members with access can view this campaign.",
  public: "Anyone can view; voting still requires sign-in.",
};

export const CAMPAIGN_VISIBILITY: Record<
  CampaignVisibility,
  CampaignVisibilityConfig
> = {
  private: {
    icon: RiLockLine,
    iconClassName: "text-amber-700 dark:text-amber-300",
    surfaceClassName: "bg-amber-500/15",
    label: VISIBILITY_LABELS.private,
    description: VISIBILITY_DESCRIPTION.private,
  },
  public: {
    icon: RiGlobalLine,
    iconClassName: "text-sky-700 dark:text-sky-300",
    surfaceClassName: "bg-sky-500/15",
    label: VISIBILITY_LABELS.public,
    description: VISIBILITY_DESCRIPTION.public,
  },
};

export function getCampaignVisibilityConfig(
  visibility: CampaignVisibility,
): CampaignVisibilityConfig {
  return CAMPAIGN_VISIBILITY[visibility];
}

"use client";

import { cn } from "@/lib/utils";

export type CampaignManagementMode = "lead" | "overview";

const STORAGE_PREFIX = "campaign-mgmt-mode:";

export function loadCampaignManagementMode(
  campaignId: string,
): CampaignManagementMode {
  if (typeof window === "undefined") return "lead";
  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${campaignId}`);
  return raw === "overview" ? "overview" : "lead";
}

export function saveCampaignManagementMode(
  campaignId: string,
  mode: CampaignManagementMode,
): void {
  window.localStorage.setItem(`${STORAGE_PREFIX}${campaignId}`, mode);
}

export function CampaignManagementModeSwitch({
  mode,
  onModeChange,
  className,
}: {
  mode: CampaignManagementMode;
  onModeChange: (mode: CampaignManagementMode) => void;
  className?: string;
}) {
  return (
    <fieldset
      className={cn(
        "flex w-full rounded-lg border border-border bg-background/80 p-0.5",
        className,
      )}
    >
      <legend className="sr-only">Campaign management mode</legend>
      <button
        type="button"
        className={cn(
          "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
          mode === "lead"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onModeChange("lead")}
      >
        Lead mode
      </button>
      <button
        type="button"
        className={cn(
          "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
          mode === "overview"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onModeChange("overview")}
      >
        Overview
      </button>
    </fieldset>
  );
}

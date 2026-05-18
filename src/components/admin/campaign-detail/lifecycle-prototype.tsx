"use client";

import type { api } from "@cvx/_generated/api";
import {
  RiArchiveLine,
  RiCheckboxCircleLine,
  RiDraftLine,
  RiEyeLine,
  RiPlayCircleLine,
  RiStopCircleLine,
  RiTrophyLine,
} from "@remixicon/react";
import type { FunctionReturnType } from "convex/server";
import type { CampaignLifecycle } from "@/components/admin/campaign-labels";
import { Button } from "@/components/ui/button";
import { normalizeCampaignLifecycle } from "@/lib/campaign-lifecycle";
import { cn } from "@/lib/utils";

type CampaignRow = NonNullable<
  FunctionReturnType<typeof api.campaigns.getForAdmin>
>;

export type ProposedLifecycle = CampaignLifecycle;

const PROPOSED_STEPS: {
  id: ProposedLifecycle;
  label: string;
  icon: typeof RiDraftLine;
}[] = [
  { id: "draft", label: "Draft", icon: RiDraftLine },
  { id: "launched", label: "Launched", icon: RiEyeLine },
  { id: "vote_live", label: "Vote live", icon: RiPlayCircleLine },
  { id: "vote_ended", label: "Vote ended", icon: RiStopCircleLine },
  { id: "finished", label: "Finished", icon: RiTrophyLine },
  { id: "archived", label: "Archived", icon: RiArchiveLine },
];

export function mapToProposedLifecycle(lifecycle: string): ProposedLifecycle {
  const normalized = normalizeCampaignLifecycle(lifecycle);
  return normalized;
}

function stepIndex(step: ProposedLifecycle): number {
  return PROPOSED_STEPS.findIndex((s) => s.id === step);
}

type LifecycleStepperProps = {
  active: ProposedLifecycle;
  orientation: "vertical" | "horizontal";
  className?: string;
};

export function LifecycleStepper({
  active,
  orientation,
  className,
}: LifecycleStepperProps) {
  const activeIdx = stepIndex(active);

  return (
    <ol
      className={cn(
        orientation === "vertical"
          ? "flex flex-col gap-0"
          : "grid grid-cols-3 gap-y-4 sm:grid-cols-6",
        className,
      )}
    >
      {PROPOSED_STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === active;
        const isPast = index < activeIdx;
        const isFuture = index > activeIdx;

        return (
          <li
            key={step.id}
            className={cn(
              orientation === "vertical"
                ? "relative flex gap-3 pb-5 last:pb-0"
                : "relative flex flex-col items-center px-1 text-center",
            )}
          >
            {orientation === "vertical" && index < PROPOSED_STEPS.length - 1 ? (
              <span
                className={cn(
                  "absolute top-7 left-[11px] h-[calc(100%-1.25rem)] w-px",
                  isPast ? "bg-emerald-500/60" : "bg-border",
                )}
                aria-hidden
              />
            ) : null}
            <div
              className={cn(
                "relative z-10 flex shrink-0 items-center justify-center rounded-full border-2 p-1",
                isActive &&
                  "border-primary bg-primary text-primary-foreground shadow-sm",
                isPast &&
                  "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                isFuture && "border-border bg-muted text-muted-foreground",
              )}
            >
              {isPast ? (
                <RiCheckboxCircleLine className="size-4" aria-hidden />
              ) : (
                <Icon className="size-4" aria-hidden />
              )}
            </div>
            <div
              className={cn(
                orientation === "vertical"
                  ? "min-w-0 pt-0.5"
                  : "mt-2 max-w-[4.5rem]",
              )}
            >
              <p
                className={cn(
                  "text-xs font-medium leading-tight sm:text-sm",
                  isActive && "text-foreground",
                  isPast && "text-emerald-800 dark:text-emerald-200",
                  isFuture && "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              {isActive ? (
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Current
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

type PrototypeActionsProps = {
  campaign: CampaignRow;
  layout: "sidebar" | "hero" | "column";
};

export function PrototypeLifecycleActions({
  campaign,
  layout,
}: PrototypeActionsProps) {
  const proposed = mapToProposedLifecycle(campaign.lifecycle);

  const actions: {
    label: string;
    variant: "default" | "secondary" | "outline";
  }[] = [];

  switch (proposed) {
    case "draft":
      actions.push(
        { label: "Launch (browse only)", variant: "outline" },
        { label: "Launch & open voting", variant: "default" },
      );
      break;
    case "launched":
      actions.push({ label: "Open voting", variant: "default" });
      break;
    case "vote_live":
      actions.push({ label: "Close voting", variant: "secondary" });
      break;
    case "vote_ended":
      actions.push({ label: "Finish campaign", variant: "default" });
      break;
    case "finished":
      actions.push({ label: "Archive", variant: "outline" });
      break;
    default:
      break;
  }

  if (proposed === "draft") {
    actions.unshift({ label: "Manage categories", variant: "outline" });
    actions.unshift({ label: "Edit details", variant: "outline" });
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        layout === "hero" && "sm:flex-row sm:flex-wrap",
        layout === "column" && "gap-1.5",
      )}
    >
      {actions.map((action) => (
        <Button
          key={action.label}
          type="button"
          variant={action.variant}
          size={layout === "column" ? "sm" : "default"}
          className={cn(layout === "column" && "w-full justify-start")}
          disabled
          title="Prototype preview — actions are not wired yet"
        >
          {action.label}
        </Button>
      ))}
      {actions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No actions at this stage.
        </p>
      ) : null}
    </div>
  );
}

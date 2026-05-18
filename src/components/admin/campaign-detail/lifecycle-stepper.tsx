"use client";

import {
  RiArchiveLine,
  RiCheckboxCircleLine,
  RiDraftLine,
  RiEyeLine,
  RiPlayCircleLine,
  RiStopCircleLine,
  RiTrophyLine,
} from "@remixicon/react";
import type { CampaignLifecycle } from "@/components/admin/campaign-labels";
import { LIFECYCLE_STEPS } from "@/components/admin/campaign-labels";
import { normalizeCampaignLifecycle } from "@/lib/campaign-lifecycle";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<CampaignLifecycle, typeof RiDraftLine> = {
  draft: RiDraftLine,
  launched: RiEyeLine,
  vote_live: RiPlayCircleLine,
  vote_ended: RiStopCircleLine,
  finished: RiTrophyLine,
  archived: RiArchiveLine,
};

type LifecycleStepperProps = {
  lifecycle: string;
  orientation?: "vertical" | "horizontal";
  className?: string;
};

export function LifecycleStepper({
  lifecycle,
  orientation = "vertical",
  className,
}: LifecycleStepperProps) {
  const active = normalizeCampaignLifecycle(lifecycle);
  const activeIdx = LIFECYCLE_STEPS.indexOf(active);

  return (
    <ol
      className={cn(
        orientation === "vertical"
          ? "flex flex-col gap-0"
          : "grid grid-cols-3 gap-y-4 sm:grid-cols-6",
        className,
      )}
    >
      {LIFECYCLE_STEPS.map((step, index) => {
        const Icon = STEP_ICONS[step];
        const isActive = step === active;
        const isPast = index < activeIdx;
        const isFuture = index > activeIdx;

        return (
          <li
            key={step}
            className={cn(
              orientation === "vertical"
                ? "relative flex gap-3 pb-5 last:pb-0"
                : "relative flex flex-col items-center px-1 text-center",
            )}
          >
            {orientation === "vertical" &&
            index < LIFECYCLE_STEPS.length - 1 ? (
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
                {step === "vote_live"
                  ? "Vote live"
                  : step === "vote_ended"
                    ? "Vote ended"
                    : step.charAt(0).toUpperCase() + step.slice(1)}
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

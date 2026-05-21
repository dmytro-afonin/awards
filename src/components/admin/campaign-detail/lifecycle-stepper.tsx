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
  variant?: "default" | "hero-overlay";
  className?: string;
};

export function LifecycleStepper({
  lifecycle,
  orientation = "vertical",
  variant = "default",
  className,
}: LifecycleStepperProps) {
  const active = normalizeCampaignLifecycle(lifecycle);
  const activeIdx = LIFECYCLE_STEPS.indexOf(active);
  const isHeroOverlay = variant === "hero-overlay";

  return (
    <ol
      className={cn(
        orientation === "vertical"
          ? "flex flex-col gap-0"
          : isHeroOverlay
            ? "flex w-full items-start justify-between gap-1"
            : "grid grid-cols-3 gap-y-4 sm:grid-cols-6",
        className,
      )}
    >
      {LIFECYCLE_STEPS.map((step, index) => {
        const Icon = STEP_ICONS[step];
        const isActive = step === active;
        const isPast = index < activeIdx;
        const isFuture = index > activeIdx;

        const stepLabel =
          step === "vote_live"
            ? "Vote live"
            : step === "vote_ended"
              ? "Vote ended"
              : step.charAt(0).toUpperCase() + step.slice(1);

        return (
          <li
            key={step}
            className={cn(
              orientation === "vertical"
                ? "relative flex gap-3 pb-5 last:pb-0"
                : isHeroOverlay
                  ? "relative flex min-w-0 flex-1 flex-col items-center"
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
            {orientation === "horizontal" &&
            isHeroOverlay &&
            index < LIFECYCLE_STEPS.length - 1 ? (
              <span
                className={cn(
                  "absolute top-3.5 left-[calc(50%+0.75rem)] h-px w-[calc(100%-1.5rem)]",
                  isPast ? "bg-emerald-400/70" : "bg-white/25",
                )}
                aria-hidden
              />
            ) : null}
            <div
              className={cn(
                "relative z-10 flex shrink-0 items-center justify-center rounded-full border-2 p-1",
                isHeroOverlay &&
                  isActive &&
                  "border-white bg-white text-indigo-900 shadow-md",
                isHeroOverlay &&
                  isPast &&
                  "border-emerald-300/80 bg-emerald-500/25 text-white",
                isHeroOverlay &&
                  isFuture &&
                  "border-white/30 bg-white/10 text-white/60",
                !isHeroOverlay &&
                  isActive &&
                  "border-primary bg-primary text-primary-foreground shadow-sm",
                !isHeroOverlay &&
                  isPast &&
                  "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                !isHeroOverlay &&
                  isFuture &&
                  "border-border bg-muted text-muted-foreground",
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
                  : isHeroOverlay
                    ? "mt-1.5 max-w-[4.25rem] text-center"
                    : "mt-2 max-w-[4.5rem]",
              )}
            >
              <p
                className={cn(
                  "font-medium leading-tight",
                  isHeroOverlay
                    ? "text-[10px] sm:text-xs"
                    : "text-xs sm:text-sm",
                  isHeroOverlay && isActive && "font-semibold text-white",
                  isHeroOverlay && isPast && "text-emerald-100",
                  isHeroOverlay && isFuture && "text-white/55",
                  !isHeroOverlay && isActive && "text-foreground",
                  !isHeroOverlay &&
                    isPast &&
                    "text-emerald-800 dark:text-emerald-200",
                  !isHeroOverlay && isFuture && "text-muted-foreground",
                )}
              >
                {stepLabel}
              </p>
              {isActive && !isHeroOverlay ? (
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

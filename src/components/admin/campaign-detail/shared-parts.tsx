"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { RiStarFill, RiTrophyLine } from "@remixicon/react";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useRouter } from "next/navigation";
import { startTransition, useCallback } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { normalizeCampaignLifecycle } from "@/lib/campaign-lifecycle";
import { cn } from "@/lib/utils";

export type CategoryOverview = FunctionReturnType<
  typeof api.campaignCategories.overviewForAdmin
>[number];

type Nominee = CategoryOverview["nominees"][number];

/** How nominees are laid out within each category */
export type NomineeLayout = "scroll" | "grid" | "grid-compact";

type CategoriesOverviewListProps = {
  categories: CategoryOverview[];
  nomineeLayout: NomineeLayout;
  campaignLifecycle: string;
  className?: string;
};

export function CategoriesOverviewList({
  categories,
  nomineeLayout,
  campaignLifecycle,
  className,
}: CategoriesOverviewListProps) {
  const state = normalizeCampaignLifecycle(campaignLifecycle);
  const showWinners = state === "vote_ended" || state === "finished";

  if (categories.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No categories yet. Add categories while the campaign is in draft.
      </p>
    );
  }

  return (
    <ul
      className={cn(
        "flex flex-col gap-6",
        nomineeLayout === "grid-compact" && "gap-4",
        className,
      )}
    >
      {categories.map((category) => (
        <CategoryOverviewItem
          key={category._id}
          category={category}
          nomineeLayout={nomineeLayout}
          showWinners={showWinners}
          canFinalize={state === "vote_ended"}
        />
      ))}
    </ul>
  );
}

function NomineeCard({
  nominee,
  isWinner,
  compact = false,
  fluid = false,
}: {
  nominee: Nominee;
  isWinner: boolean;
  compact?: boolean;
  /** Fill grid cell width instead of fixed card width */
  fluid?: boolean;
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg border bg-card ring-1 ring-border transition-shadow",
        !fluid && "shrink-0",
        fluid && "w-full",
        !fluid && (compact ? "w-[7.5rem]" : "w-[9.5rem] sm:w-[10.5rem]"),
        isWinner && "border-amber-500/40 ring-amber-500/30",
      )}
    >
      <div
        className={cn(
          "relative w-full bg-muted",
          compact ? "aspect-[4/3]" : "aspect-square",
        )}
      >
        {nominee.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${nominee.imageUrl})` }}
            role="img"
            aria-label={nominee.name}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
            {nominee.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        {isWinner ? (
          <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
            <RiTrophyLine className="size-3.5" aria-hidden />
            <span className="sr-only">Winner</span>
          </span>
        ) : null}
      </div>
      <div className={cn("flex flex-col gap-0.5 p-2", compact && "p-1.5")}>
        <p
          className={cn(
            "line-clamp-2 font-medium leading-tight text-foreground",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {nominee.name}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {nominee.voteCount} {nominee.voteCount === 1 ? "vote" : "votes"}
        </p>
      </div>
    </article>
  );
}

function NomineesGallery({
  nominees,
  layout,
  showWinners,
  winnerId,
}: {
  nominees: Nominee[];
  layout: NomineeLayout;
  showWinners: boolean;
  winnerId?: Id<"campaignNominees">;
}) {
  if (nominees.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No nominees in this category.
      </p>
    );
  }

  const compact = layout === "grid-compact";

  if (layout === "scroll" || layout === "grid-compact") {
    return (
      <div
        className={cn(
          "-mx-1 flex gap-3 overflow-x-auto px-1 pb-1",
          "snap-x snap-mandatory scroll-smooth",
        )}
      >
        {nominees.map((nominee) => (
          <div key={nominee._id} className="snap-start">
            <NomineeCard
              nominee={nominee}
              isWinner={showWinners && winnerId === nominee._id}
              compact={compact}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {nominees.map((nominee) => (
        <NomineeCard
          key={nominee._id}
          nominee={nominee}
          isWinner={showWinners && winnerId === nominee._id}
          fluid
        />
      ))}
    </div>
  );
}

function CategoryOverviewItem({
  category,
  nomineeLayout,
  showWinners,
  canFinalize,
}: {
  category: CategoryOverview;
  nomineeLayout: NomineeLayout;
  showWinners: boolean;
  canFinalize: boolean;
}) {
  const router = useRouter();
  const { showShareMessage } = useAdmin();
  const finalizeCategory = useMutation(api.campaignCategories.finalizeCategory);
  const setCategoryWinner = useMutation(
    api.campaignCategories.setCategoryWinner,
  );

  const winnerId = category.winnerNomineeId;
  const isFinished = category.categoryStatus === "finished";
  const isGrid = nomineeLayout === "grid";

  const handleFinalize = useCallback(async () => {
    try {
      await finalizeCategory({ categoryId: category._id });
      showShareMessage(`"${category.name}" finalized`);
      startTransition(() => router.refresh());
    } catch (error) {
      showShareMessage(
        error instanceof Error ? error.message : "Could not finalize.",
        "error",
      );
    }
  }, [category._id, category.name, finalizeCategory, router, showShareMessage]);

  const handleOverride = useCallback(
    async (nomineeId: string) => {
      try {
        await setCategoryWinner({
          categoryId: category._id,
          nomineeId: nomineeId as Id<"campaignNominees">,
        });
        showShareMessage(`Winner updated for "${category.name}"`);
        startTransition(() => router.refresh());
      } catch (error) {
        showShareMessage(
          error instanceof Error ? error.message : "Could not set winner.",
          "error",
        );
      }
    },
    [category._id, category.name, router, setCategoryWinner, showShareMessage],
  );

  return (
    <li
      className={cn(
        isGrid &&
          "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        nomineeLayout === "scroll" &&
          "border-b border-border pb-6 last:border-0",
        nomineeLayout === "grid-compact" &&
          "rounded-lg bg-muted/20 p-3 ring-1 ring-border/50",
      )}
    >
      <div
        className={cn(
          "mb-3 flex flex-wrap items-start gap-3",
          isGrid && "border-b border-border bg-muted/30 p-4",
        )}
      >
        {category.imageUrl ? (
          <div
            className="size-11 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-border"
            style={{ backgroundImage: `url(${category.imageUrl})` }}
            role="img"
            aria-label={category.name}
          />
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
            {category.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={cn(
                "font-semibold text-foreground",
                nomineeLayout === "grid-compact" ? "text-sm" : "text-base",
              )}
            >
              {category.name}
            </h3>
            <Badge variant="outline" className="tabular-nums">
              {category.voteCount} votes
            </Badge>
            {isFinished ? <Badge variant="secondary">Finalized</Badge> : null}
          </div>
          {canFinalize && !isFinished ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={handleFinalize}
            >
              Finalize category
            </Button>
          ) : null}
          {canFinalize && isFinished ? (
            <div className="mt-2 max-w-xs">
              <Select
                value={winnerId ?? null}
                onValueChange={(value) => {
                  if (value) void handleOverride(value);
                }}
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Override winner" />
                </SelectTrigger>
                <SelectContent>
                  {category.nominees.map((nominee) => (
                    <SelectItem key={nominee._id} value={nominee._id}>
                      {nominee.name} ({nominee.voteCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </div>

      <div className={cn(isGrid && "p-4")}>
        <NomineesGallery
          nominees={category.nominees}
          layout={nomineeLayout}
          showWinners={showWinners}
          winnerId={winnerId}
        />
      </div>
    </li>
  );
}

type StatTileProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: "default" | "sky" | "amber" | "emerald" | "violet";
};

const ACCENT_CLASS: Record<NonNullable<StatTileProps["accent"]>, string> = {
  default: "border-border bg-card",
  sky: "border-sky-500/30 bg-sky-500/5",
  amber: "border-amber-500/30 bg-amber-500/5",
  emerald: "border-emerald-500/30 bg-emerald-500/5",
  violet: "border-violet-500/30 bg-violet-500/5",
};

export function StatTile({
  label,
  value,
  hint,
  accent = "default",
}: StatTileProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border p-4",
        ACCENT_CLASS[accent],
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ReadinessChecklist({
  canLaunch,
  categoryCount,
  categories,
}: {
  canLaunch: boolean;
  categoryCount: number;
  categories: { name: string; nomineeCount: number }[];
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-start gap-2">
        {categoryCount > 0 ? (
          <RiStarFill className="mt-0.5 size-4 text-emerald-600" />
        ) : (
          <span className="mt-1 size-4 rounded-full border-2 border-muted-foreground/40" />
        )}
        <div>
          <p className="font-medium">At least one category</p>
          <p className="text-muted-foreground">
            {categoryCount > 0 ? `${categoryCount} added` : "None yet"}
          </p>
        </div>
      </div>
      {categories.map((category) => (
        <div key={category.name} className="flex items-start gap-2 pl-6">
          {category.nomineeCount >= 2 ? (
            <RiStarFill className="mt-0.5 size-4 text-emerald-600" />
          ) : (
            <span className="mt-1 size-4 rounded-full border-2 border-muted-foreground/40" />
          )}
          <div>
            <p className="font-medium">{category.name}</p>
            <p className="text-muted-foreground">
              {category.nomineeCount}/2 nominees minimum
            </p>
          </div>
        </div>
      ))}
      <p
        className={cn(
          "rounded-md px-3 py-2 text-xs font-medium",
          canLaunch
            ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
            : "bg-muted text-muted-foreground",
        )}
      >
        {canLaunch ? "Ready to launch" : "Complete setup before launching"}
      </p>
    </div>
  );
}

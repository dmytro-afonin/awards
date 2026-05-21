"use client";

import type { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { RiArrowRightLine, RiStarFill, RiTrophyLine } from "@remixicon/react";
import type { FunctionReturnType } from "convex/server";
import { CategoryBallotControls } from "@/components/admin/campaign-detail/category-ballot-controls";
import { CategoryStatusIndicator } from "@/components/admin/campaign-detail/category-status-indicator";
import { HoverShareViewActions } from "@/components/admin/campaign-detail/hover-share-view-actions";
import { Button } from "@/components/ui/button";
import { normalizeCampaignLifecycle } from "@/lib/campaign-lifecycle";
import {
  canAdvanceFromCategory,
  categoryStatusSurface,
  currentRunwayCategory,
  nextCategoryInOrder,
} from "@/lib/category-run";
import { publicCategoryPath } from "@/lib/public-campaign-url";
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
  slug?: string;
  workspaceId?: Id<"workspaces">;
  showPublicLinks?: boolean;
  className?: string;
};

export function CategoriesOverviewList({
  categories,
  nomineeLayout,
  campaignLifecycle,
  slug = "",
  workspaceId,
  showPublicLinks = false,
  className,
}: CategoriesOverviewListProps) {
  const state = normalizeCampaignLifecycle(campaignLifecycle);
  const canManageBallot = state === "vote_live" || state === "vote_ended";
  const runwayCategory = canManageBallot
    ? currentRunwayCategory(categories)
    : undefined;

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
        "flex flex-col gap-4",
        nomineeLayout === "grid-compact" && "gap-3",
        className,
      )}
    >
      {categories.map((category) => (
        <CategoryOverviewItem
          key={category._id}
          category={category}
          categories={categories}
          nomineeLayout={nomineeLayout}
          showWinners={category.categoryStatus === "finished"}
          canManageBallot={canManageBallot}
          isRunwayFocus={runwayCategory?._id === category._id}
          slug={slug}
          workspaceId={workspaceId}
          showPublicLinks={showPublicLinks && Boolean(workspaceId)}
        />
      ))}
    </ul>
  );
}

function NomineeCard({
  nominee,
  isWinner,
  showVoteCounts,
  showPublicLinks,
  publicHref,
  compact = false,
  fluid = false,
}: {
  nominee: Nominee;
  isWinner: boolean;
  showVoteCounts: boolean;
  showPublicLinks: boolean;
  publicHref?: string;
  compact?: boolean;
  fluid?: boolean;
}) {
  return (
    <article
      className={cn(
        "group/nominee relative overflow-hidden rounded-lg border bg-muted ring-1 ring-border transition-shadow",
        !fluid && "shrink-0",
        fluid && "w-full",
        !fluid && (compact ? "w-[7.5rem]" : "w-[9.5rem] sm:w-[10.5rem]"),
        compact ? "aspect-[4/3]" : "aspect-square",
        isWinner && "border-amber-500/40 ring-amber-500/30",
      )}
    >
      {showPublicLinks && publicHref ? (
        <HoverShareViewActions
          viewHref={publicHref}
          hoverVisibleClassName="group-hover/nominee:opacity-100 group-focus-within/nominee:opacity-100"
          className="absolute top-1.5 left-1.5 z-10 rounded-md bg-background/90 p-0.5 shadow-sm backdrop-blur-sm"
        />
      ) : null}
      {nominee.imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${nominee.imageUrl})` }}
          role="img"
          aria-label={nominee.name}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-muted-foreground">
          {nominee.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      {isWinner ? (
        <span className="absolute top-1.5 right-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
          <RiTrophyLine className="size-3.5" aria-hidden />
          <span className="sr-only">Winner</span>
        </span>
      ) : null}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/85 via-black/55 to-transparent transition-opacity duration-200",
          "group-hover/nominee:opacity-0 group-focus-within/nominee:opacity-0",
          compact ? "px-1.5 pt-6 pb-1.5" : "px-2 pt-8 pb-2",
        )}
      >
        <p
          className={cn(
            "line-clamp-2 font-medium leading-tight text-white",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {nominee.name}
        </p>
        {showVoteCounts ? (
          <p className="text-xs tabular-nums text-white/75">
            {nominee.voteCount} {nominee.voteCount === 1 ? "vote" : "votes"}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function NomineesGallery({
  nominees,
  layout,
  showWinners,
  showVoteCounts,
  showPublicLinks,
  categoryPublicHref,
  winnerId,
}: {
  nominees: Nominee[];
  layout: NomineeLayout;
  showWinners: boolean;
  showVoteCounts: boolean;
  showPublicLinks: boolean;
  categoryPublicHref?: string;
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
              showVoteCounts={showVoteCounts}
              showPublicLinks={showPublicLinks}
              publicHref={categoryPublicHref}
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
          showVoteCounts={showVoteCounts}
          showPublicLinks={showPublicLinks}
          publicHref={categoryPublicHref}
          fluid
        />
      ))}
    </div>
  );
}

function CategoryOverviewItem({
  category,
  categories,
  nomineeLayout,
  showWinners,
  canManageBallot,
  isRunwayFocus,
  slug,
  workspaceId,
  showPublicLinks,
}: {
  category: CategoryOverview;
  categories: CategoryOverview[];
  nomineeLayout: NomineeLayout;
  showWinners: boolean;
  canManageBallot: boolean;
  isRunwayFocus?: boolean;
  slug: string;
  workspaceId?: Id<"workspaces">;
  showPublicLinks: boolean;
}) {
  const winnerId = category.winnerNomineeId;
  const isGrid = nomineeLayout === "grid";
  const votesRevealed = category.categoryStatus === "finished";
  const categoryPublicHref =
    workspaceId && showPublicLinks
      ? publicCategoryPath(slug, workspaceId, category.slug)
      : undefined;
  const nextCategory = nextCategoryInOrder(categories, category._id);
  const canAdvance = canAdvanceFromCategory(category.categoryStatus);

  return (
    <li
      id={`admin-category-${category._id}`}
      className={cn(
        "group scroll-mt-28 overflow-hidden rounded-xl border shadow-sm transition-colors",
        categoryStatusSurface(category.categoryStatus, {
          runwayFocus: isRunwayFocus,
        }),
        nomineeLayout === "scroll" && "p-4 md:p-5",
        nomineeLayout === "grid-compact" && "p-3",
        isGrid && "p-0",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          isGrid && "border-b border-border/60 p-4",
          !isGrid && "mb-4",
        )}
      >
        {category.imageUrl ? (
          <div
            className="size-14 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-border md:size-16"
            style={{ backgroundImage: `url(${category.imageUrl})` }}
            role="img"
            aria-label={category.name}
          />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-medium text-muted-foreground md:size-16">
            {category.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h3
            className={cn(
              "truncate font-semibold text-foreground",
              nomineeLayout === "grid-compact" ? "text-sm" : "text-base",
            )}
          >
            {category.name}
          </h3>
          {votesRevealed ? (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
              {category.voteCount} votes
            </span>
          ) : null}
          <CategoryStatusIndicator
            status={category.categoryStatus}
            size="compact"
          />
        </div>
        {showPublicLinks && categoryPublicHref ? (
          <HoverShareViewActions viewHref={categoryPublicHref} />
        ) : null}
        {canManageBallot &&
        (category.categoryStatus === "open" ||
          category.categoryStatus === "voting_closed") ? (
          <CategoryBallotControls
            category={category}
            categories={categories}
            labelMode={isRunwayFocus ? "always" : "icon-only"}
          />
        ) : null}
      </div>

      <div className={cn(isGrid && "p-4")}>
        <NomineesGallery
          nominees={category.nominees}
          layout={nomineeLayout}
          showWinners={showWinners}
          showVoteCounts={votesRevealed}
          showPublicLinks={showPublicLinks}
          categoryPublicHref={categoryPublicHref}
          winnerId={winnerId}
        />
      </div>

      {canManageBallot && isRunwayFocus && nextCategory ? (
        <div
          className={cn(
            "flex justify-end border-t border-border/50 pt-3",
            isGrid ? "px-4 pb-4" : "mt-4",
          )}
        >
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5 bg-background/60 backdrop-blur-sm"
            disabled={!canAdvance}
            title={
              canAdvance
                ? `Go to ${nextCategory.name}`
                : category.categoryStatus === "open"
                  ? "Close voting and reveal the winner before moving on"
                  : "Reveal the winner before moving to the next category"
            }
            onClick={() => {
              document
                .getElementById(`admin-category-${nextCategory._id}`)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Next: {nextCategory.name}
            <RiArrowRightLine className="size-4" />
          </Button>
        </div>
      ) : null}
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

"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import {
  RiArrowDownSLine,
  RiCheckLine,
  RiStopCircleLine,
  RiTrophyLine,
} from "@remixicon/react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { startTransition, useCallback } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import {
  ToolbarActionButton,
  type ToolbarLabelMode,
} from "@/components/admin/campaign-detail/toolbar-icon-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type CategoryOverview,
  firstCategoryWithStatus,
} from "@/lib/category-run";
import { cn } from "@/lib/utils";

export function CategoryBallotControls({
  category,
  categories,
  onRevealSuccess,
  labelMode = "icon-only",
}: {
  category: CategoryOverview;
  categories: CategoryOverview[];
  onRevealSuccess?: () => void;
  labelMode?: ToolbarLabelMode;
}) {
  const router = useRouter();
  const { showShareMessage } = useAdmin();
  const closeVoting = useMutation(api.campaignCategories.closeCategoryVoting);
  const revealWinner = useMutation(api.campaignCategories.revealCategoryWinner);
  const setCategoryWinner = useMutation(
    api.campaignCategories.setCategoryWinner,
  );

  const closeHead = firstCategoryWithStatus(categories, "open");
  const revealHead = firstCategoryWithStatus(categories, "voting_closed");
  const lockedWinner = category.winnerNomineeId
    ? category.nominees.find((n) => n._id === category.winnerNomineeId)
    : undefined;
  const showLabel = labelMode === "always";

  const confirmCloseOrder = useCallback(() => {
    if (
      !closeHead ||
      category.categoryStatus !== "open" ||
      category._id === closeHead._id
    ) {
      return true;
    }
    return window.confirm(
      `Close voting for "${category.name}" before "${closeHead.name}"?`,
    );
  }, [category, closeHead]);

  const confirmRevealOrder = useCallback(() => {
    if (
      !revealHead ||
      category.categoryStatus !== "voting_closed" ||
      category._id === revealHead._id
    ) {
      return true;
    }
    return window.confirm(
      `Reveal winner for "${category.name}" before "${revealHead.name}"?`,
    );
  }, [category, revealHead]);

  const handleClose = useCallback(async () => {
    if (!confirmCloseOrder()) return;
    try {
      await closeVoting({ categoryId: category._id });
      showShareMessage(`Voting closed for "${category.name}"`);
      startTransition(() => router.refresh());
    } catch (error) {
      showShareMessage(
        error instanceof Error ? error.message : "Could not close voting.",
        "error",
      );
    }
  }, [
    category._id,
    category.name,
    closeVoting,
    confirmCloseOrder,
    router,
    showShareMessage,
  ]);

  const handleReveal = useCallback(async () => {
    if (!confirmRevealOrder()) return;
    try {
      await revealWinner({ categoryId: category._id });
      showShareMessage(`Winner revealed for "${category.name}"`);
      onRevealSuccess?.();
      startTransition(() => router.refresh());
    } catch (error) {
      showShareMessage(
        error instanceof Error ? error.message : "Could not reveal winner.",
        "error",
      );
    }
  }, [
    category._id,
    category.name,
    confirmRevealOrder,
    onRevealSuccess,
    revealWinner,
    router,
    showShareMessage,
  ]);

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

  if (category.categoryStatus === "finished") {
    return null;
  }

  if (category.categoryStatus === "open") {
    return (
      <ToolbarActionButton
        label="Close voting"
        icon={<RiStopCircleLine className="size-4" />}
        variant="default"
        className="bg-sky-600 text-white hover:bg-sky-700"
        labelMode={labelMode}
        onClick={() => void handleClose()}
      />
    );
  }

  const revealButton = (
    <Button
      type="button"
      size={showLabel ? "default" : "icon-sm"}
      className={cn(
        "shrink-0 gap-1.5 rounded-r-none bg-amber-500 text-amber-950 hover:bg-amber-400",
        !showLabel && "size-9",
      )}
      onClick={() => void handleReveal()}
    >
      <RiTrophyLine className="size-4" />
      {showLabel ? (
        <span>Show winner</span>
      ) : (
        <span className="sr-only">Show winner</span>
      )}
    </Button>
  );

  return (
    <div className="inline-flex shrink-0 items-stretch">
      {showLabel ? (
        revealButton
      ) : (
        <Tooltip>
          <TooltipTrigger render={revealButton} />
          <TooltipContent>Show winner</TooltipContent>
        </Tooltip>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              size="icon-sm"
              aria-label="Winner options"
              className={cn(
                "rounded-l-none border-l border-amber-700/25 bg-amber-500 text-amber-950 hover:bg-amber-400",
                showLabel ? "size-9 w-8 px-0" : "size-9",
              )}
            />
          }
        >
          <RiArrowDownSLine className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuGroup>
            {lockedWinner ? (
              <DropdownMenuLabel className="font-normal text-foreground">
                Locked: {lockedWinner.name}
              </DropdownMenuLabel>
            ) : null}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Override winner</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="min-w-48">
                {category.nominees.map((nominee) => (
                  <DropdownMenuItem
                    key={nominee._id}
                    onClick={() => void handleOverride(nominee._id)}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {nominee.name} ({nominee.voteCount})
                    </span>
                    {category.winnerNomineeId === nominee._id ? (
                      <RiCheckLine className="size-4 shrink-0" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

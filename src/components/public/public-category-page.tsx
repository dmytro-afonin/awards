"use client";

import { useAuth } from "@clerk/nextjs";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { RiArrowLeftLine, RiCheckLine } from "@remixicon/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CampaignNotFound } from "@/components/public/campaign-not-found";
import { EntityImage } from "@/components/public/entity-image";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  parseWorkspaceIdFromSearch,
  publicCampaignPath,
} from "@/lib/public-campaign-url";
import { cn } from "@/lib/utils";

export function PublicCategoryPage({
  slug,
  categoryId,
}: {
  slug: string;
  categoryId: Id<"campaignCategories">;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const workspaceId = parseWorkspaceIdFromSearch(searchParams.toString());
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(`${pathname}?${searchParams.toString()}`)}`;

  const data = useQuery(api.publicCampaigns.getCategory, {
    slug,
    categoryId,
    workspaceId,
  });
  const castVote = useMutation(api.publicCampaigns.castVote);

  const [pendingNomineeId, setPendingNomineeId] =
    useState<Id<"campaignNominees"> | null>(null);
  const [selectedId, setSelectedId] = useState<Id<"campaignNominees"> | null>(
    null,
  );

  const activeSelection = selectedId ?? data?.selectedNomineeId ?? null;

  if (data === undefined) {
    return (
      <PublicShell>
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </PublicShell>
    );
  }

  if (data === null) {
    return <CampaignNotFound />;
  }

  const backHref = publicCampaignPath(
    data.campaign.slug,
    data.campaign.workspaceId,
  );

  const handleVote = async (nomineeId: Id<"campaignNominees">) => {
    if (!data.canVote || pendingNomineeId !== null) {
      return;
    }
    setPendingNomineeId(nomineeId);
    setSelectedId(nomineeId);
    try {
      await castVote({
        campaignId: data.campaign._id,
        categoryId: data.category._id,
        nomineeId,
      });
      toast.success("Vote saved");
    } catch (error) {
      setSelectedId(data.selectedNomineeId);
      const message =
        error instanceof Error ? error.message : "Could not save your vote.";
      toast.error(message);
    } finally {
      setPendingNomineeId(null);
    }
  };

  return (
    <PublicShell>
      <div className="flex flex-col gap-6">
        <Link
          href={backHref}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-fit gap-1.5 px-0",
          )}
        >
          <RiArrowLeftLine className="size-4" aria-hidden />
          {data.campaign.name}
        </Link>

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {data.votingOpen ? "Voting open" : "Voting closed"}
            </Badge>
            {activeSelection ? (
              <Badge className="gap-1 bg-emerald-700 text-white dark:bg-emerald-600">
                <RiCheckLine className="size-3.5" aria-hidden />
                Voted
              </Badge>
            ) : null}
          </div>
          <h1 className="font-heading text-2xl font-semibold md:text-3xl">
            {data.category.name}
          </h1>
          {data.votingOpen && !data.canVote && clerkLoaded && !isSignedIn ? (
            <>
              <p className="text-sm text-muted-foreground">
                Sign in to vote in this category.
              </p>
              <Link
                href={signInHref}
                className={buttonVariants({ size: "sm", className: "w-fit" })}
              >
                Sign in to vote
              </Link>
            </>
          ) : null}
          {data.votingOpen && data.canVote ? (
            <p className="text-sm text-muted-foreground">
              Choose one nominee. You can change your vote while voting is open.
            </p>
          ) : null}
          {!data.votingOpen && data.campaign.lifecycle === "finished" ? (
            <p className="text-sm text-muted-foreground">
              Voting has ended. Results reflect final ballots.
            </p>
          ) : null}
        </header>

        {data.nominees.length === 0 ? (
          <p className="text-sm text-muted-foreground">No nominees yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {data.nominees.map((nominee) => {
              const isSelected = activeSelection === nominee._id;
              const voteInFlight = pendingNomineeId !== null;
              const canSelect = data.canVote && !authLoading && isAuthenticated;

              return (
                <li key={nominee._id}>
                  <button
                    type="button"
                    disabled={!canSelect || voteInFlight}
                    onClick={() => void handleVote(nominee._id)}
                    className={cn(
                      "flex h-full w-full flex-col overflow-hidden border bg-card text-left transition-colors",
                      isSelected
                        ? "border-emerald-600 ring-2 ring-emerald-600/30"
                        : "border-border hover:border-foreground/25 hover:bg-muted/30",
                      !canSelect && "cursor-default opacity-90",
                    )}
                  >
                    <EntityImage
                      imageUrl={nominee.imageUrl}
                      label={nominee.name}
                      aspect={1}
                      className="w-full border-0 border-b border-border"
                    />
                    <div className="flex flex-1 items-center justify-between gap-2 p-4">
                      <span className="font-medium">{nominee.name}</span>
                      {isSelected ? (
                        <RiCheckLine
                          className="size-5 shrink-0 text-emerald-600"
                          aria-hidden
                        />
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {clerkLoaded && isSignedIn && data.votingOpen && !data.canVote ? (
          <p className="text-sm text-muted-foreground">
            You cannot vote in this campaign.
          </p>
        ) : null}
      </div>
    </PublicShell>
  );
}

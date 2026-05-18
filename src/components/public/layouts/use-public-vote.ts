"use client";

import { useAuth } from "@clerk/nextjs";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useConvexAuth, useMutation } from "convex/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type CategoryVoteData = {
  campaign: { _id: Id<"campaigns"> };
  category: { _id: Id<"campaignCategories"> };
  selectedNomineeId: Id<"campaignNominees"> | null;
  votingOpen: boolean;
  canVote: boolean;
};

export function usePublicVote(data: CategoryVoteData | undefined) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const castVote = useMutation(api.publicCampaigns.castVote);

  const [pendingNomineeId, setPendingNomineeId] =
    useState<Id<"campaignNominees"> | null>(null);
  const [selectedId, setSelectedId] = useState<Id<"campaignNominees"> | null>(
    null,
  );

  const activeSelection = selectedId ?? data?.selectedNomineeId ?? null;
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(`${pathname}?${searchParams.toString()}`)}`;
  const canSelect = Boolean(data?.canVote && !authLoading && isAuthenticated);
  const voteInFlight = pendingNomineeId !== null;

  const handleVote = async (nomineeId: Id<"campaignNominees">) => {
    if (!data?.canVote || pendingNomineeId !== null) {
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

  return {
    activeSelection,
    handleVote,
    pendingNomineeId,
    canSelect,
    voteInFlight,
    signInHref,
    clerkLoaded,
    isSignedIn,
    authLoading,
    isAuthenticated,
  };
}

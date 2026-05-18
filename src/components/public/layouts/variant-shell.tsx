"use client";

import type { Id } from "@cvx/_generated/dataModel";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  publicCampaignPath,
  publicCategoriesPath,
} from "@/lib/public-campaign-url";
import type { PublicLayoutId } from "@/lib/public-layout";
import { cn } from "@/lib/utils";
import type { usePublicVote } from "./use-public-vote";

type CampaignRef = {
  slug: string;
  workspaceId: Id<"workspaces">;
  name: string;
};

export function BackToCampaign({
  campaign,
  layout,
  className,
}: {
  campaign: CampaignRef;
  layout: PublicLayoutId;
  className?: string;
}) {
  return (
    <Link
      href={publicCampaignPath(campaign.slug, campaign.workspaceId, layout)}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "w-fit px-0",
        className,
      )}
    >
      ← {campaign.name}
    </Link>
  );
}

export function BackToCategories({
  campaign,
  layout,
  className,
  label = "Categories",
}: {
  campaign: CampaignRef;
  layout: PublicLayoutId;
  className?: string;
  label?: string;
}) {
  return (
    <Link
      href={publicCategoriesPath(campaign.slug, campaign.workspaceId, layout)}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "w-fit px-0",
        className,
      )}
    >
      ← {label}
    </Link>
  );
}

export function SignInToVote({
  vote,
  className,
}: {
  vote: ReturnType<typeof usePublicVote>;
  className?: string;
}) {
  if (!vote.clerkLoaded || vote.isSignedIn) {
    return null;
  }
  return (
    <Link
      href={vote.signInHref}
      className={cn(buttonVariants({ size: "sm" }), "w-fit", className)}
    >
      Sign in to vote
    </Link>
  );
}

export function StartVotingLink({
  href,
  votingOpen,
  className,
  children,
}: {
  href: string;
  votingOpen: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link href={href} className={cn(buttonVariants({ size: "lg" }), className)}>
      {children ?? (votingOpen ? "Start voting" : "View categories")}
    </Link>
  );
}

"use client";

import { api } from "@cvx/_generated/api";
import { RiArrowRightLine, RiCheckLine } from "@remixicon/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CampaignNotFound } from "@/components/public/campaign-not-found";
import { EntityImage } from "@/components/public/entity-image";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  parseWorkspaceIdFromSearch,
  publicCategoryPath,
} from "@/lib/public-campaign-url";
import { cn } from "@/lib/utils";

export function PublicCampaignPage({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const workspaceId = parseWorkspaceIdFromSearch(searchParams.toString());
  const campaign = useQuery(api.publicCampaigns.getBySlug, {
    slug,
    workspaceId,
  });

  if (campaign === undefined) {
    return (
      <PublicShell>
        <Skeleton className="mb-6 h-48 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </PublicShell>
    );
  }

  if (campaign === null) {
    return <CampaignNotFound />;
  }

  const statusLabel = campaign.votingOpen
    ? "Voting open"
    : campaign.lifecycle === "finished"
      ? "Voting closed"
      : "View only";

  return (
    <PublicShell>
      <article className="flex flex-col gap-8">
        <header className="flex flex-col gap-4">
          <EntityImage
            imageUrl={campaign.imageUrl}
            label={campaign.name}
            aspect={16 / 9}
            className="w-full"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{statusLabel}</Badge>
            {campaign.visibility === "private" ? (
              <Badge variant="outline">Workspace members</Badge>
            ) : null}
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            {campaign.name}
          </h1>
          {campaign.description ? (
            <p className="max-w-2xl text-muted-foreground">
              {campaign.description}
            </p>
          ) : null}
          {campaign.votingOpen && !campaign.canVote ? (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Sign in to cast your votes.
            </p>
          ) : null}
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-medium">Categories</h2>
          {campaign.categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No categories have been published yet.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {campaign.categories.map((category) => (
                <li key={category._id}>
                  <Link
                    href={publicCategoryPath(
                      campaign.slug,
                      campaign.workspaceId,
                      category._id,
                    )}
                    className={cn(
                      "group flex h-full flex-col overflow-hidden border border-border bg-card text-foreground no-underline transition-colors",
                      "hover:border-foreground/25 hover:bg-muted/30",
                    )}
                  >
                    <EntityImage
                      imageUrl={category.imageUrl}
                      label={category.name}
                      aspect={4 / 3}
                      className="w-full border-0 border-b border-border"
                    />
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading font-medium leading-snug">
                          {category.name}
                        </h3>
                        <RiArrowRightLine
                          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {category.nomineeCount} nominee
                        {category.nomineeCount === 1 ? "" : "s"}
                      </p>
                      {category.selectedNomineeId ? (
                        <p className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                          <RiCheckLine className="size-3.5" aria-hidden />
                          Vote recorded
                        </p>
                      ) : campaign.votingOpen ? (
                        <p className="text-xs text-muted-foreground">
                          Tap to vote
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </PublicShell>
  );
}

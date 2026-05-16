"use client";

import type { api } from "@cvx/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { ExternalLink, Eye, FolderTree, Share2, Users } from "lucide-react";
import Link from "next/link";
import { useAdmin } from "@/components/admin/admin-context";
import {
  formatDateRange,
  LIFECYCLE_LABELS,
  VISIBILITY_LABELS,
} from "@/components/admin/campaign-labels";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export type CampaignRow = FunctionReturnType<
  typeof api.campaigns.listForWorkspace
>[number];

function CampaignBadges({ campaign }: { campaign: CampaignRow }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant="secondary">{LIFECYCLE_LABELS[campaign.lifecycle]}</Badge>
      <Badge variant="outline">{VISIBILITY_LABELS[campaign.visibility]}</Badge>
    </div>
  );
}

function CampaignMeta({ campaign }: { campaign: CampaignRow }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <FolderTree className="size-3.5" />
        {campaign.categoryCount} categories
      </span>
      <span className="inline-flex items-center gap-1">
        <Users className="size-3.5" />
        {campaign.nomineeCount} nominees
      </span>
      <span>
        {formatDateRange(campaign.votingStartsAt, campaign.votingEndsAt)}
      </span>
    </div>
  );
}

function CampaignActions({ campaign }: { campaign: CampaignRow }) {
  const { showShareMessage } = useAdmin();

  const handleShare = async () => {
    const publicUrl = `${window.location.origin}/c/${campaign.slug}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      showShareMessage("Campaign link copied");
    } catch {
      showShareMessage("Could not copy link");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/c/${campaign.slug}`}
        prefetch={false}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <Eye className="size-3.5" />
        Preview
      </Link>
      <Link
        href={`/c/${campaign.slug}`}
        prefetch={false}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <ExternalLink className="size-3.5" />
        Public view
      </Link>
      <Button variant="ghost" size="sm" type="button" onClick={handleShare}>
        <Share2 className="size-3.5" />
        Share
      </Button>
    </div>
  );
}

export function CampaignCard({ campaign }: { campaign: CampaignRow }) {
  return (
    <Card className="overflow-hidden">
      {campaign.imageUrl ? (
        <div
          className="h-36 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${campaign.imageUrl})` }}
        />
      ) : (
        <div className="flex h-36 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
          No cover image
        </div>
      )}
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{campaign.name}</CardTitle>
          <CampaignBadges campaign={campaign} />
        </div>
        {campaign.description ? (
          <CardDescription className="line-clamp-2">
            {campaign.description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <CampaignMeta campaign={campaign} />
      </CardContent>
      <CardFooter>
        <CampaignActions campaign={campaign} />
      </CardFooter>
    </Card>
  );
}

export function CampaignListRow({ campaign }: { campaign: CampaignRow }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 gap-4">
        {campaign.imageUrl ? (
          <div
            className="size-16 shrink-0 rounded-md bg-cover bg-center"
            style={{ backgroundImage: `url(${campaign.imageUrl})` }}
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] text-muted-foreground">
            No image
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-medium">{campaign.name}</h3>
            <CampaignBadges campaign={campaign} />
          </div>
          {campaign.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {campaign.description}
            </p>
          ) : null}
          <CampaignMeta campaign={campaign} />
        </div>
      </div>
      <CampaignActions campaign={campaign} />
    </div>
  );
}

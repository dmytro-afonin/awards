"use client";

import { api } from "@cvx/_generated/api";
import {
  RiDeleteBinLine,
  RiEyeLine,
  RiPencilLine,
  RiShareLine,
} from "@remixicon/react";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import type { CampaignRow } from "@/components/admin/campaign-row";
import { CampaignVisibilityIcon } from "@/components/campaign-visibility";

export type { CampaignRow } from "@/components/admin/campaign-row";

import { CampaignLifecycleActions } from "@/components/admin/campaign-lifecycle-actions";
import { CampaignLifecycleBadge } from "@/components/admin/campaign-lifecycle-badge";
import { CampaignStats } from "@/components/admin/campaign-stats";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { canShowRowDelete, canShowRowEditLink } from "@/lib/campaign-lifecycle";
import { cn } from "@/lib/utils";

function CampaignBadges({ campaign }: { campaign: CampaignRow }) {
  return <CampaignLifecycleBadge lifecycle={campaign.lifecycle} />;
}

function CampaignRowActions({
  campaign,
  layout = "row",
}: {
  campaign: CampaignRow;
  layout?: "row" | "icons";
}) {
  const router = useRouter();
  const { showShareMessage } = useAdmin();
  const removeCampaign = useMutation(api.campaigns.remove);

  const editHref = `/admin/campaigns/${campaign._id}`;
  const viewHref = `/c/${campaign.slug}`;
  const showRowEditLink = canShowRowEditLink(campaign.lifecycle);
  const showRowDelete = canShowRowDelete(campaign.lifecycle);

  const handleShare = async () => {
    const publicUrl = `${window.location.origin}/c/${campaign.slug}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      showShareMessage("Campaign link copied");
    } catch {
      showShareMessage("Could not copy link", "error");
    }
  };

  const handleDelete = async () => {
    if (!showRowDelete) return;
    if (
      !window.confirm(
        `Delete "${campaign.name}"? It will be hidden from the campaign list.`,
      )
    ) {
      return;
    }
    try {
      await removeCampaign({ campaignId: campaign._id });
      showShareMessage("Campaign deleted");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete campaign.";
      showShareMessage(message, "error");
    }
  };

  const iconOnly = layout === "icons";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1",
        iconOnly ? "justify-end" : "gap-2",
      )}
    >
      <CampaignLifecycleActions
        campaignId={campaign._id}
        campaignName={campaign.name}
        lifecycle={campaign.lifecycle}
        size="sm"
      />
      <Button
        variant="ghost"
        size={iconOnly ? "icon-sm" : "sm"}
        type="button"
        onClick={handleShare}
        aria-label="Share"
        title="Share"
      >
        <RiShareLine className="size-4" />
        {!iconOnly ? "Share" : null}
      </Button>
      <Link
        href={viewHref}
        prefetch={false}
        className={buttonVariants({
          variant: "ghost",
          size: iconOnly ? "icon-sm" : "sm",
        })}
        aria-label="View"
        title="View"
      >
        <RiEyeLine className="size-4" />
        {!iconOnly ? "View" : null}
      </Link>
      {showRowEditLink ? (
        <Link
          href={editHref}
          className={buttonVariants({
            variant: "ghost",
            size: iconOnly ? "icon-sm" : "sm",
          })}
          aria-label="Edit"
          title="Edit"
        >
          <RiPencilLine className="size-4" />
          {!iconOnly ? "Edit" : null}
        </Link>
      ) : null}
      {showRowDelete ? (
        <Button
          variant="ghost"
          size={iconOnly ? "icon-sm" : "sm"}
          type="button"
          onClick={handleDelete}
          aria-label="Delete"
          title="Delete"
          className="text-destructive hover:text-destructive"
        >
          <RiDeleteBinLine className="size-4" />
          {!iconOnly ? "Delete" : null}
        </Button>
      ) : null}
    </div>
  );
}

export function CampaignTable({ campaigns }: { campaigns: CampaignRow[] }) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {campaigns.map((campaign) => (
        <div
          key={campaign._id}
          className="flex items-center gap-3 px-4 py-3 sm:gap-4"
        >
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <CampaignVisibilityIcon visibility={campaign.visibility} />
              <Link
                href={`/admin/campaigns/${campaign._id}`}
                className="min-w-0 truncate font-medium text-foreground underline-offset-4 hover:underline"
              >
                {campaign.name}
              </Link>
              <CampaignBadges campaign={campaign} />
            </div>
            <CampaignStats
              campaign={campaign}
              className="mt-0.5 text-sm [&_span]:truncate"
            />
          </div>
          <div className="shrink-0">
            <CampaignRowActions campaign={campaign} layout="icons" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CampaignCard({ campaign }: { campaign: CampaignRow }) {
  const editHref = `/admin/campaigns/${campaign._id}`;

  return (
    <Card className="overflow-hidden">
      <Link
        href={editHref}
        className="block text-foreground no-underline outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring"
      >
        {campaign.imageUrl ? (
          <div
            className="h-36 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${campaign.imageUrl})` }}
          />
        ) : (
          <div className="flex h-36 w-full items-center justify-center bg-muted text-muted-foreground">
            No cover image
          </div>
        )}
        <CardHeader className="gap-2">
          <div className="flex items-start gap-2">
            <CampaignVisibilityIcon
              visibility={campaign.visibility}
              className="mt-0.5"
            />
            <CardTitle className="min-w-0 flex-1">{campaign.name}</CardTitle>
            <CampaignBadges campaign={campaign} />
          </div>
          {campaign.description ? (
            <CardDescription className="line-clamp-2">
              {campaign.description}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          <CampaignStats campaign={campaign} />
        </CardContent>
      </Link>
      <CardFooter>
        <CampaignRowActions campaign={campaign} />
      </CardFooter>
    </Card>
  );
}

export function CampaignListRow({ campaign }: { campaign: CampaignRow }) {
  const editHref = `/admin/campaigns/${campaign._id}`;

  return (
    <Item variant="outline" size="default" className="flex-col sm:flex-row">
      <Link
        href={editHref}
        className="flex min-w-0 flex-1 flex-col gap-4 text-foreground no-underline outline-none sm:flex-row sm:items-center sm:gap-4 focus-visible:ring-2 focus-visible:ring-ring"
      >
        {campaign.imageUrl ? (
          <ItemMedia variant="image" className="size-16 shrink-0">
            <div
              className="size-full bg-cover bg-center"
              style={{ backgroundImage: `url(${campaign.imageUrl})` }}
              role="img"
              aria-hidden
            />
          </ItemMedia>
        ) : (
          <ItemMedia
            variant="image"
            className="flex size-16 shrink-0 items-center justify-center text-muted-foreground"
          >
            <span className="text-center text-xs">No image</span>
          </ItemMedia>
        )}
        <ItemContent className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <CampaignVisibilityIcon visibility={campaign.visibility} />
            <ItemTitle className="line-clamp-2 min-w-0 flex-1 normal-case">
              {campaign.name}
            </ItemTitle>
            <CampaignBadges campaign={campaign} />
          </div>
          {campaign.description ? (
            <ItemDescription>{campaign.description}</ItemDescription>
          ) : null}
          <CampaignStats campaign={campaign} className="mt-1 text-sm" />
        </ItemContent>
      </Link>
      <ItemActions className="shrink-0 justify-end">
        <CampaignRowActions campaign={campaign} />
      </ItemActions>
    </Item>
  );
}

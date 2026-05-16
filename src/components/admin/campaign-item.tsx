"use client";

import type { api } from "@cvx/_generated/api";
import type { FunctionReturnType } from "convex/server";
import {
  ExternalLink,
  Eye,
  FolderTree,
  Pencil,
  Share2,
  Users,
} from "lucide-react";
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

export function CampaignTable({ campaigns }: { campaigns: CampaignRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[36rem] caption-bottom text-sm">
        <thead className="border-b bg-muted/50">
          <tr className="text-left">
            <th className="h-10 px-3 align-middle font-medium">Campaign</th>
            <th className="h-10 px-3 align-middle font-medium">Status</th>
            <th className="h-10 px-3 align-middle font-medium">Visibility</th>
            <th className="h-10 px-3 align-middle font-medium">Voting</th>
            <th className="h-10 px-3 align-middle font-medium">Content</th>
            <th className="h-10 px-3 text-right align-middle font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr
              key={campaign._id}
              className="border-b border-border last:border-0 transition-colors hover:bg-muted/40"
            >
              <td className="p-3 align-middle font-medium">
                <Link
                  href={`/admin/campaigns/${campaign._id}`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {campaign.name}
                </Link>
              </td>
              <td className="p-3 align-middle">
                <Badge variant="secondary">
                  {LIFECYCLE_LABELS[campaign.lifecycle]}
                </Badge>
              </td>
              <td className="p-3 align-middle">
                <Badge variant="outline">
                  {VISIBILITY_LABELS[campaign.visibility]}
                </Badge>
              </td>
              <td className="p-3 align-middle text-muted-foreground">
                {formatDateRange(
                  campaign.votingStartsAt,
                  campaign.votingEndsAt,
                )}
              </td>
              <td className="p-3 align-middle text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <FolderTree className="size-3.5 shrink-0" />
                  {campaign.categoryCount}
                </span>
                <span className="mx-1.5 text-border">·</span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5 shrink-0" />
                  {campaign.nomineeCount}
                </span>
              </td>
              <td className="p-3 align-middle">
                <div className="flex flex-wrap justify-end gap-2">
                  <Link
                    href={`/admin/campaigns/${campaign._id}`}
                    className={buttonVariants({
                      variant: "default",
                      size: "sm",
                    })}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Link>
                  <Link
                    href={`/c/${campaign.slug}`}
                    prefetch={false}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    <Eye className="size-3.5" />
                    Preview
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
        href={`/admin/campaigns/${campaign._id}`}
        className={buttonVariants({ variant: "default", size: "sm" })}
      >
        <Pencil className="size-3.5" />
        Edit
      </Link>
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
      </Link>
      <CardFooter>
        <CampaignActions campaign={campaign} />
      </CardFooter>
    </Card>
  );
}

export function CampaignListRow({ campaign }: { campaign: CampaignRow }) {
  const editHref = `/admin/campaigns/${campaign._id}`;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href={editHref}
        className="flex min-w-0 flex-1 gap-4 text-foreground no-underline outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring"
      >
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
      </Link>
      <CampaignActions campaign={campaign} />
    </div>
  );
}

"use client";

import { api } from "@cvx/_generated/api";
import {
  RiAddLine,
  RiLayoutGridLine,
  RiListUnordered,
  RiSearchLine,
} from "@remixicon/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useMemo } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { CampaignCard, CampaignTable } from "@/components/admin/campaign-item";
import { CampaignListFilters } from "@/components/admin/campaign-list-filters";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { sortCampaigns } from "@/lib/campaign-sort";

export function CampaignsView() {
  const {
    workspaceId,
    search,
    setSearch,
    lifecycleFilters,
    setLifecycleFilters,
    viewMode,
    setViewMode,
    campaignSort,
    setCampaignSort,
  } = useAdmin();
  const isMobile = useIsMobile();
  const effectiveViewMode = isMobile ? "cards" : viewMode;

  const noStatusesSelected = lifecycleFilters.length === 0;

  const campaigns = useQuery(
    api.campaigns.listForWorkspace,
    workspaceId && !noStatusesSelected
      ? {
          workspaceId,
          lifecycles: lifecycleFilters,
          search: search.trim() || undefined,
        }
      : "skip",
  );

  const isLoading =
    workspaceId && !noStatusesSelected && campaigns === undefined;
  const isEmpty = !noStatusesSelected && campaigns?.length === 0;

  const sortedCampaigns = useMemo(
    () => sortCampaigns(campaigns ?? [], campaignSort),
    [campaigns, campaignSort],
  );

  const gridClassName = useMemo(
    () =>
      effectiveViewMode === "cards"
        ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        : "flex flex-col gap-3",
    [effectiveViewMode],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex w-full min-w-0 items-center gap-2">
        <InputGroup className="h-9 min-w-0 flex-1">
          <InputGroupAddon align="inline-start">
            <RiSearchLine />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            aria-label="Search campaigns"
          />
        </InputGroup>

        <CampaignListFilters
          lifecycleFilters={lifecycleFilters}
          onLifecycleFiltersChange={setLifecycleFilters}
          sort={campaignSort}
          onSortChange={setCampaignSort}
        />

        <Tabs
          value={viewMode}
          onValueChange={(value) =>
            setViewMode(value === "list" ? "list" : "cards")
          }
          className="hidden shrink-0 gap-0 data-horizontal:flex-row md:flex"
        >
          <TabsList className="h-9 gap-0.5 overflow-hidden p-0.5">
            <TabsTrigger
              value="cards"
              aria-label="Card view"
              className="size-8 shrink-0 flex-none px-0 py-0 after:hidden"
            >
              <RiLayoutGridLine className="size-4" />
            </TabsTrigger>
            <TabsTrigger
              value="list"
              aria-label="List view"
              className="size-8 shrink-0 flex-none px-0 py-0 after:hidden"
            >
              <RiListUnordered className="size-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {!workspaceId ? (
        <p className="text-sm text-muted-foreground">
          Select a workspace to view campaigns.
        </p>
      ) : noStatusesSelected ? (
        <p className="text-sm text-muted-foreground">
          Select at least one status to show campaigns.
        </p>
      ) : isLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : isEmpty ? (
        <Empty className="border border-dashed border-border">
          <EmptyHeader>
            <EmptyTitle>No campaigns match</EmptyTitle>
            <EmptyDescription>
              Try adjusting search or status filters.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              href="/admin/campaigns/new"
              className={buttonVariants({ className: "inline-flex gap-1.5" })}
            >
              <RiAddLine className="size-4" />
              New campaign
            </Link>
          </EmptyContent>
        </Empty>
      ) : effectiveViewMode === "cards" ? (
        <div className={gridClassName}>
          {sortedCampaigns.map((campaign) => (
            <CampaignCard key={campaign._id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <CampaignTable campaigns={sortedCampaigns} />
      )}
    </div>
  );
}

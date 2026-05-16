"use client";

import { api } from "@cvx/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, LayoutGrid, List, Plus, Search } from "lucide-react";
import { useMemo } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import {
  CampaignCard,
  CampaignListRow,
} from "@/components/admin/campaign-item";
import type { CampaignLifecycle } from "@/components/admin/campaign-labels";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LIFECYCLE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "ready", label: "Ready" },
  { value: "started", label: "Started" },
  { value: "finished", label: "Finished" },
];

export function CampaignsView() {
  const {
    workspaceId,
    search,
    setSearch,
    lifecycle,
    setLifecycle,
    viewMode,
    setViewMode,
    shareMessage,
    showShareMessage,
  } = useAdmin();

  const createCampaign = useMutation(api.campaigns.create);

  const lifecycleFilter =
    lifecycle === "all" ? undefined : (lifecycle as CampaignLifecycle);

  const campaigns = useQuery(
    api.campaigns.listForWorkspace,
    workspaceId
      ? {
          workspaceId,
          lifecycle: lifecycleFilter,
          search: search.trim() || undefined,
        }
      : "skip",
  );

  const isLoading = workspaceId && campaigns === undefined;
  const isEmpty = campaigns?.length === 0;

  const handleCreateCampaign = async () => {
    if (!workspaceId) return;
    try {
      await createCampaign({ workspaceId });
    } catch {
      showShareMessage("Could not create campaign");
    }
  };

  const gridClassName = useMemo(
    () =>
      viewMode === "cards"
        ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        : "flex flex-col gap-3",
    [viewMode],
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {shareMessage ? (
        <p
          className="rounded-md border border-border bg-muted px-3 py-2 text-sm"
          role="status"
        >
          {shareMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={lifecycle}
            onValueChange={(value) => setLifecycle(value ?? "all")}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIFECYCLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs
            value={viewMode}
            onValueChange={(value) =>
              setViewMode(value === "list" ? "list" : "cards")
            }
          >
            <TabsList>
              <TabsTrigger value="cards" aria-label="Card view">
                <LayoutGrid className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="list" aria-label="List view">
                <List className="size-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button type="button" />}>
              <Plus className="size-4" />
              Add new
              <ChevronDown className="size-4 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCreateCampaign}>
                Campaign
              </DropdownMenuItem>
              <DropdownMenuItem disabled>User (soon)</DropdownMenuItem>
              <DropdownMenuItem disabled>Category (soon)</DropdownMenuItem>
              <DropdownMenuItem disabled>Nominee (soon)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {!workspaceId ? (
        <p className="text-sm text-muted-foreground">
          Select a workspace to view campaigns.
        </p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Loading campaigns…</p>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No campaigns yet. Create your first campaign to get started.
          </p>
          <Button type="button" onClick={handleCreateCampaign}>
            <Plus className="size-4" />
            New campaign
          </Button>
        </div>
      ) : (
        <div className={gridClassName}>
          {campaigns?.map((campaign) =>
            viewMode === "cards" ? (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ) : (
              <CampaignListRow key={campaign._id} campaign={campaign} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

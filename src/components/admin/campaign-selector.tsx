"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { RiAddLine, RiArrowUpDownLine, RiCheckLine } from "@remixicon/react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import type { CampaignRow } from "@/components/admin/campaign-item";
import { LIFECYCLE_BADGE_CLASS } from "@/components/admin/campaign-labels";
import { CampaignLifecycleBadge } from "@/components/admin/campaign-lifecycle-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { normalizeCampaignLifecycle } from "@/lib/campaign-lifecycle";
import { cn } from "@/lib/utils";

function campaignInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "C";
}

function CampaignSelectorIcon({ campaign }: { campaign: CampaignRow }) {
  const lifecycle = normalizeCampaignLifecycle(campaign.lifecycle);
  const badgeClass =
    LIFECYCLE_BADGE_CLASS[lifecycle] ??
    "border-transparent bg-muted text-muted-foreground";

  return (
    <div
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-medium",
        badgeClass,
      )}
      aria-hidden
    >
      {campaignInitial(campaign.name)}
    </div>
  );
}

function triggerLabel({
  campaigns,
  selectedCampaign,
  isCampaignListRoot,
}: {
  campaigns: CampaignRow[] | undefined;
  selectedCampaign: CampaignRow | undefined;
  isCampaignListRoot: boolean;
}): string {
  if (selectedCampaign) return selectedCampaign.name;
  if (campaigns === undefined) return "Loading campaigns…";
  if (campaigns.length === 0) return "No campaigns";
  if (isCampaignListRoot) return "All Campaigns";
  return "Select campaign";
}

export function CampaignSelector({
  isCampaignListRoot,
}: {
  isCampaignListRoot: boolean;
}) {
  const router = useRouter();
  const { workspaceId, selectedCampaignId, setSelectedCampaignId } = useAdmin();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const campaigns = useQuery(
    api.campaigns.listForWorkspace,
    workspaceId ? { workspaceId } : "skip",
  );

  const selectedCampaign = useMemo(
    () =>
      campaigns && selectedCampaignId
        ? campaigns.find((c) => c._id === selectedCampaignId)
        : undefined,
    [campaigns, selectedCampaignId],
  );

  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    const query = search.trim().toLowerCase();
    if (!query) return campaigns;
    return campaigns.filter((c) => c.name.toLowerCase().includes(query));
  }, [campaigns, search]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const goToNewCampaign = () => {
    if (!workspaceId) return;
    setOpen(false);
    startTransition(() => {
      router.push("/admin/campaigns/new");
    });
  };

  const selectCampaign = (id: Id<"campaigns">) => {
    setSelectedCampaignId(id);
    setOpen(false);
    startTransition(() => {
      router.push(`/admin/campaigns/${id}`);
    });
  };

  const label = triggerLabel({
    campaigns,
    selectedCampaign,
    isCampaignListRoot,
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-9 w-full min-w-0 justify-between gap-2 px-3 font-normal"
            disabled={!workspaceId}
          />
        }
      >
        <span className="min-w-0 truncate">{label}</span>
        <RiArrowUpDownLine className="size-4 shrink-0 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-(--anchor-width) min-w-56 overflow-hidden rounded-lg p-0"
        sideOffset={6}
      >
        <div className="border-b border-border/50 p-2">
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find campaign…"
            className="h-8 rounded-lg bg-muted/40 text-sm shadow-none"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setOpen(false);
                return;
              }
              event.stopPropagation();
            }}
          />
        </div>
        <ScrollArea className="max-h-64">
          <div className="p-1">
            {campaigns === undefined ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Loading campaigns…
              </p>
            ) : filteredCampaigns.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {search.trim() ? "No matching campaigns" : "No campaigns yet"}
              </p>
            ) : (
              filteredCampaigns.map((campaign) => {
                const isActive = campaign._id === selectedCampaignId;
                return (
                  <DropdownMenuItem
                    key={campaign._id}
                    className="gap-2 rounded-md px-2 py-1.5"
                    onClick={() => selectCampaign(campaign._id)}
                  >
                    <CampaignSelectorIcon campaign={campaign} />
                    <span className="min-w-0 flex-1 truncate">
                      {campaign.name}
                    </span>
                    <CampaignLifecycleBadge
                      lifecycle={campaign.lifecycle}
                      className="hidden shrink-0 px-1.5 py-0 text-[10px] font-normal sm:inline-flex"
                    />
                    {isActive ? (
                      <RiCheckLine className="size-4 shrink-0 opacity-70" />
                    ) : null}
                  </DropdownMenuItem>
                );
              })
            )}
          </div>
        </ScrollArea>
        <DropdownMenuSeparator className="mx-0" />
        <DropdownMenuItem
          className="gap-2 rounded-none px-3 py-2"
          onClick={goToNewCampaign}
          disabled={!workspaceId}
        >
          <RiAddLine className="size-4" />
          Create campaign
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

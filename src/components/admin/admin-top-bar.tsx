"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useQuery } from "convex/react";
import { Menu } from "lucide-react";
import { useEffect } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminTopBar() {
  const {
    workspaceId,
    selectedCampaignId,
    setSelectedCampaignId,
    setMobileNavOpen,
  } = useAdmin();

  const campaigns = useQuery(
    api.campaigns.listForWorkspace,
    workspaceId ? { workspaceId } : "skip",
  );

  useEffect(() => {
    if (!campaigns?.length) {
      setSelectedCampaignId(null);
      return;
    }
    if (
      selectedCampaignId &&
      campaigns.some((c) => c._id === selectedCampaignId)
    ) {
      return;
    }
    setSelectedCampaignId(campaigns[0]._id);
  }, [campaigns, selectedCampaignId, setSelectedCampaignId]);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        type="button"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>
      <h1 className="text-lg font-semibold tracking-tight">Campaigns</h1>
      <div className="ml-auto flex min-w-0 max-w-xs flex-1 justify-end sm:max-w-sm">
        <Select
          value={selectedCampaignId ?? ""}
          onValueChange={(value) => {
            if (value) setSelectedCampaignId(value as Id<"campaigns">);
          }}
          disabled={!campaigns?.length}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue
              placeholder={
                campaigns === undefined
                  ? "Loading campaigns…"
                  : campaigns.length === 0
                    ? "No campaigns"
                    : "Select campaign"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {campaigns?.map((campaign) => (
              <SelectItem key={campaign._id} value={campaign._id}>
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}

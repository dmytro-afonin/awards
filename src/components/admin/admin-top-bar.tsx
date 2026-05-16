"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useQuery } from "convex/react";
import { ChevronDown, Menu, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminTopBar() {
  const router = useRouter();
  const pathname = usePathname();
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

  const selectedCampaign = useMemo(
    () =>
      campaigns && selectedCampaignId
        ? campaigns.find((c) => c._id === selectedCampaignId)
        : undefined,
    [campaigns, selectedCampaignId],
  );

  const pageTitle = useMemo(() => {
    if (
      pathname === "/admin/campaigns/new" ||
      pathname === "/admin/campaigns/new/"
    ) {
      return "New campaign";
    }
    if (
      pathname.startsWith("/admin/campaigns/") &&
      pathname !== "/admin/campaigns/new" &&
      pathname !== "/admin/campaigns/new/"
    ) {
      return "Edit campaign";
    }
    return "Campaigns";
  }, [pathname]);

  const isCampaignListRoot = pathname === "/admin" || pathname === "/admin/";

  const goToNewCampaign = () => {
    if (!workspaceId) return;
    startTransition(() => {
      router.push("/admin/campaigns/new");
    });
  };

  // Selection follows the URL: list lives at `/admin` with no campaign in context;
  // a campaign is "current" only on `/admin/campaigns/[id]` (see Campaign list vs Single campaign admin docs).
  useEffect(() => {
    if (
      pathname === "/admin/campaigns/new" ||
      pathname === "/admin/campaigns/new/"
    ) {
      setSelectedCampaignId(null);
      return;
    }

    const match = /^\/admin\/campaigns\/([^/]+)\/?$/.exec(pathname);
    if (match?.[1] && match[1] !== "new") {
      const fromUrl = match[1] as Id<"campaigns">;
      if (campaigns === undefined) {
        return;
      }
      if (campaigns.some((c) => c._id === fromUrl)) {
        setSelectedCampaignId(fromUrl);
        return;
      }
      setSelectedCampaignId(null);
      return;
    }

    if (pathname === "/admin" || pathname === "/admin/") {
      setSelectedCampaignId(null);
      return;
    }

    setSelectedCampaignId(null);
  }, [pathname, campaigns, setSelectedCampaignId]);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        type="button"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>
      {/* Do not use w-full here — in a flex row it steals 100% of the header and collapses siblings. */}
      <div className="w-44 min-w-0 shrink-0 sm:w-56">
        <Select
          value={selectedCampaignId ?? ""}
          onValueChange={(value) => {
            if (!value) return;
            const id = value as Id<"campaigns">;
            setSelectedCampaignId(id);
            startTransition(() => {
              router.push(`/admin/campaigns/${id}`);
            });
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
                    : isCampaignListRoot
                      ? "Open a campaign…"
                      : "Select campaign"
              }
            >
              {selectedCampaign != null ? selectedCampaign.name : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {campaigns?.map((campaign) => (
              <SelectItem
                key={campaign._id}
                value={campaign._id}
                label={campaign.name}
              >
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex min-w-0 flex-1 justify-center px-2">
        {isCampaignListRoot ? (
          <h1 className="truncate text-center text-lg font-semibold tracking-tight">
            {pageTitle}
          </h1>
        ) : (
          <Link
            href="/admin"
            className="truncate text-center text-lg font-semibold tracking-tight text-foreground underline-offset-4 hover:underline"
          >
            {pageTitle}
          </Link>
        )}
      </div>
      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                disabled={!workspaceId}
              />
            }
          >
            <Plus className="size-4" />
            Add new
            <ChevronDown className="size-4 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem onClick={goToNewCampaign}>
              Campaign
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Category</DropdownMenuItem>
            <DropdownMenuItem disabled>Nominee</DropdownMenuItem>
            <DropdownMenuItem disabled>User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

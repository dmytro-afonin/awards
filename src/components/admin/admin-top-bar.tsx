"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { RiAddLine, RiArrowDownSLine } from "@remixicon/react";
import { useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { CampaignSelector } from "@/components/admin/campaign-selector";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminTopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { workspaceId, setSelectedCampaignId } = useAdmin();

  const campaigns = useQuery(
    api.campaigns.listForWorkspace,
    workspaceId ? { workspaceId } : "skip",
  );

  const pageTitle = (() => {
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
  })();

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
      <SidebarTrigger className="-ml-1 shrink-0" />
      {/* Do not use w-full here — in a flex row it steals 100% of the header and collapses siblings. */}
      <div className="w-44 min-w-0 shrink-0 sm:w-56">
        <CampaignSelector isCampaignListRoot={isCampaignListRoot} />
      </div>
      <div className="flex min-w-0 flex-1 justify-center px-2">
        <CardTitle className="truncate text-center normal-case">
          {pageTitle}
        </CardTitle>
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
            <RiAddLine className="size-4" />
            Add new
            <RiArrowDownSLine className="size-4 opacity-70" />
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

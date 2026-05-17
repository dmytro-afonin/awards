"use client";

import { api } from "@cvx/_generated/api";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminNewCampaignPage() {
  const router = useRouter();
  const { workspaceId, showShareMessage } = useAdmin();
  const createCampaign = useMutation(api.campaigns.create);
  const started = useRef(false);

  useEffect(() => {
    if (!workspaceId || started.current) return;
    started.current = true;

    void (async () => {
      try {
        const id = await createCampaign({
          workspaceId,
          name: "Untitled campaign",
          visibility: "private",
        });
        router.replace(`/admin/campaigns/${id}`);
      } catch (error) {
        started.current = false;
        showShareMessage(
          error instanceof Error ? error.message : "Could not create campaign.",
          "error",
        );
      }
    })();
  }, [workspaceId, createCampaign, router, showShareMessage]);

  if (!workspaceId) {
    return (
      <div className="p-4 md:p-6">
        <Empty className="border border-dashed border-border">
          <EmptyHeader>
            <EmptyTitle>No workspace</EmptyTitle>
            <EmptyDescription>
              Select a workspace in the sidebar to create a campaign.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              href="/admin"
              className={buttonVariants({ variant: "outline" })}
            >
              Back to campaigns
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6" aria-busy="true">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-64 w-full max-w-xl" />
      <p className="text-sm text-muted-foreground">Creating campaign…</p>
    </div>
  );
}

"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { CampaignLifecycleBadge } from "@/components/admin/campaign-lifecycle-badge";
import { CampaignMetadataFields } from "@/components/admin/campaign-metadata-fields";
import { VisibilityChangeDialog } from "@/components/admin/visibility-change-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  canEditCampaignMetadata,
  normalizeCampaignLifecycle,
} from "@/lib/campaign-lifecycle";
import type { CampaignVisibility } from "@/lib/campaign-visibility";

type CampaignEditorProps = {
  campaignId: Id<"campaigns">;
};

export function CampaignEditor({ campaignId }: CampaignEditorProps) {
  const router = useRouter();
  const { workspaceId, setSelectedCampaignId, showShareMessage } = useAdmin();

  const campaign = useQuery(api.campaigns.getForAdmin, { campaignId });
  const updateCampaign = useMutation(api.campaigns.update);
  const setCampaignImage = useMutation(api.campaigns.setImage);
  const clearCampaignImage = useMutation(api.campaigns.clearImage);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CampaignVisibility>("private");
  const [initialVisibility, setInitialVisibility] =
    useState<CampaignVisibility>("private");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);
  const pendingSaveRef = useRef<(() => Promise<void>) | null>(null);
  const initializedCampaignIdRef = useRef<Id<"campaigns"> | null>(null);
  const slugTouchedRef = useRef(false);
  const initialSnapshotRef = useRef("");

  const campaignLifecycle = campaign
    ? normalizeCampaignLifecycle(campaign.lifecycle)
    : null;
  const fieldsDisabled =
    !campaign || !canEditCampaignMetadata(campaign.lifecycle) || saving;
  const detailHref = `/admin/campaigns/${campaignId}`;

  useEffect(() => {
    setSelectedCampaignId(campaignId);
  }, [campaignId, setSelectedCampaignId]);

  useEffect(() => {
    initializedCampaignIdRef.current = null;
    slugTouchedRef.current = false;
  }, [campaignId]);

  useEffect(() => {
    if (campaign === undefined || campaign === null) {
      return;
    }
    if (initializedCampaignIdRef.current === campaignId) {
      return;
    }
    initializedCampaignIdRef.current = campaignId;
    setName(campaign.name);
    setSlug(campaign.slug);
    setDescription(campaign.description ?? "");
    setVisibility(campaign.visibility);
    setInitialVisibility(campaign.visibility);
    setFormError(null);
    initialSnapshotRef.current = JSON.stringify({
      name: campaign.name,
      slug: campaign.slug,
      description: campaign.description ?? "",
      visibility: campaign.visibility,
    });
  }, [campaign, campaignId]);

  const isDirty = useCallback(() => {
    return (
      JSON.stringify({ name, slug, description, visibility }) !==
      initialSnapshotRef.current
    );
  }, [name, slug, description, visibility]);

  const handleSlugChange = useCallback((value: string) => {
    slugTouchedRef.current = true;
    setSlug(value);
  }, []);

  const persist = useCallback(async () => {
    const trimmed = name.trim();
    const trimmedSlug = slug.trim();
    if (!trimmed) {
      setFormError("Campaign name is required.");
      return;
    }
    if (!trimmedSlug) {
      setFormError("Slug is required.");
      return;
    }
    if (!workspaceId) {
      setFormError("Select a workspace in the sidebar first.");
      return;
    }

    setFormError(null);
    setSaving(true);
    try {
      await updateCampaign({
        campaignId,
        name: trimmed,
        description: description.trim() || undefined,
        visibility,
        slug: trimmedSlug,
      });
      showShareMessage("Campaign saved");
      initialSnapshotRef.current = JSON.stringify({
        name: trimmed,
        slug: trimmedSlug,
        description: description.trim(),
        visibility,
      });
      setInitialVisibility(visibility);
      router.replace(detailHref);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save campaign.";
      setFormError(message || "Could not save campaign. Try again.");
    } finally {
      setSaving(false);
    }
  }, [
    name,
    slug,
    description,
    visibility,
    workspaceId,
    campaignId,
    updateCampaign,
    showShareMessage,
    router,
    detailHref,
  ]);

  const handleSave = useCallback(() => {
    if (visibility !== initialVisibility && campaign) {
      pendingSaveRef.current = persist;
      setVisibilityDialogOpen(true);
      return;
    }
    void persist();
  }, [campaign, initialVisibility, persist, visibility]);

  const handleClose = useCallback(() => {
    if (isDirty()) {
      if (
        !window.confirm(
          "Discard unsaved changes and return to the campaign view?",
        )
      ) {
        return;
      }
    }
    router.push(detailHref);
  }, [detailHref, isDirty, router]);

  if (!workspaceId) {
    return (
      <div className="p-4 md:p-6">
        <Empty className="border border-dashed border-border">
          <EmptyHeader>
            <EmptyTitle>No workspace</EmptyTitle>
            <EmptyDescription>
              Select a workspace in the sidebar to create or edit campaigns.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (campaign === undefined) {
    return (
      <div className="flex flex-col gap-3 p-4 md:p-6" aria-busy="true">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (campaign === null) {
    return (
      <div className="p-4 md:p-6">
        <Empty className="border border-dashed border-border">
          <EmptyHeader>
            <EmptyTitle>Campaign not found</EmptyTitle>
            <EmptyDescription>
              This campaign could not be found, or you do not have admin access.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (!canEditCampaignMetadata(campaign.lifecycle)) {
    return (
      <div className="p-4 md:p-6">
        <Empty className="border border-dashed border-border">
          <EmptyHeader>
            <EmptyTitle>Cannot edit</EmptyTitle>
            <EmptyDescription>
              Only draft campaigns can be edited.{" "}
              {campaignLifecycle
                ? `This campaign is ${campaignLifecycle}.`
                : null}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-6 lg:max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Edit campaign</CardTitle>
            <CampaignLifecycleBadge lifecycle={campaign.lifecycle} />
          </div>
          <CardDescription>
            Update name, slug, cover photo, description, and visibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignMetadataFields
            values={{ name, slug, description, visibility }}
            onNameChange={setName}
            onSlugChange={handleSlugChange}
            onDescriptionChange={setDescription}
            onVisibilityChange={setVisibility}
            disabled={fieldsDisabled}
            formError={formError}
            campaignId={campaignId}
            imageUrl={campaign.imageUrl}
            onImageUpload={async (storageId) => {
              await setCampaignImage({ campaignId, storageId });
              showShareMessage("Cover photo updated");
            }}
            onImageRemove={async () => {
              await clearCampaignImage({ campaignId });
              showShareMessage("Cover photo removed");
            }}
          />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Close
          </Button>
        </CardFooter>
      </Card>

      <VisibilityChangeDialog
        open={visibilityDialogOpen}
        onOpenChange={setVisibilityDialogOpen}
        from={initialVisibility}
        to={visibility}
        lifecycle={campaign.lifecycle}
        onConfirm={() => {
          const save = pendingSaveRef.current;
          pendingSaveRef.current = null;
          void save?.();
        }}
      />
    </div>
  );
}

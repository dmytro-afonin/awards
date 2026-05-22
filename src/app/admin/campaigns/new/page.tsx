"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { CampaignMetadataFields } from "@/components/admin/campaign-metadata-fields";
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
import type { CampaignVisibility } from "@/lib/campaign-visibility";

export default function AdminNewCampaignPage() {
  const router = useRouter();
  const { workspaceId, showShareMessage } = useAdmin();
  const createCampaign = useMutation(api.campaigns.create);
  const getStagedImageDownloadUrl = useMutation(
    api.imageProcessing.getStagedImageDownloadUrl,
  );
  const abandonStagedImage = useMutation(
    api.imageProcessing.abandonStagedImage,
  );

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CampaignVisibility>("private");
  const [coverStorageId, setCoverStorageId] = useState<Id<"_storage"> | null>(
    null,
  );
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const slugTouchedRef = useRef(false);

  const handleSlugChange = useCallback((value: string) => {
    slugTouchedRef.current = true;
    setSlug(value);
  }, []);

  const handleCoverUpload = useCallback(
    async (storageId: Id<"_storage">) => {
      if (coverStorageId && coverStorageId !== storageId) {
        void abandonStagedImage({ storageId: coverStorageId }).catch(() => {
          /* prior staged file may already be linked or deleted */
        });
      }
      const url = await getStagedImageDownloadUrl({ storageId });
      setCoverStorageId(storageId);
      setCoverPreviewUrl(url);
      showShareMessage("Cover photo added");
    },
    [
      abandonStagedImage,
      coverStorageId,
      getStagedImageDownloadUrl,
      showShareMessage,
    ],
  );

  const handleCoverRemove = useCallback(async () => {
    if (coverStorageId) {
      await abandonStagedImage({ storageId: coverStorageId });
    }
    setCoverStorageId(null);
    setCoverPreviewUrl(null);
    showShareMessage("Cover photo removed");
  }, [abandonStagedImage, coverStorageId, showShareMessage]);

  const handleCreate = useCallback(async () => {
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
    setCreating(true);
    try {
      const id = await createCampaign({
        workspaceId,
        name: trimmed,
        slug: trimmedSlug,
        description: description.trim() || undefined,
        visibility,
        imageStorageId: coverStorageId ?? undefined,
      });
      showShareMessage("Campaign created");
      router.replace(`/admin/campaigns/${id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not create campaign.";
      setFormError(message);
    } finally {
      setCreating(false);
    }
  }, [
    name,
    slug,
    description,
    visibility,
    workspaceId,
    coverStorageId,
    createCampaign,
    router,
    showShareMessage,
  ]);

  const handleCancel = useCallback(() => {
    router.push("/admin");
  }, [router]);

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
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-6 lg:max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>New campaign</CardTitle>
          <CardDescription>
            Set up the basics including an optional cover photo. Nothing is
            saved until you click Create.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignMetadataFields
            values={{ name, slug, description, visibility }}
            onNameChange={setName}
            onSlugChange={handleSlugChange}
            onDescriptionChange={setDescription}
            onVisibilityChange={setVisibility}
            disabled={creating}
            formError={formError}
            autoSlugFromName
            slugTouchedRef={slugTouchedRef}
            workspaceId={workspaceId}
            imageUrl={coverPreviewUrl}
            onImageUpload={handleCoverUpload}
            onImageRemove={handleCoverRemove}
            showCover
          />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 border-t border-border pt-6">
          <Button
            type="button"
            onClick={() => void handleCreate()}
            disabled={creating || !name.trim()}
          >
            {creating ? "Creating…" : "Create"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={creating}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

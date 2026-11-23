"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const slugTouchedRef = useRef(false);
  const stagedCoverRef = useRef<Id<"_storage"> | null>(null);

  const abandonCover = useCallback(() => {
    const storageId = stagedCoverRef.current;
    stagedCoverRef.current = null;
    if (storageId) {
      void abandonStagedImage({ storageId }).catch(() => {
        /* Staged file may already be linked or deleted */
      });
    }
  }, [abandonStagedImage]);

  // Abandon a cover that was staged but never linked to a campaign when the
  // form is left via navigation, back button, or refresh.
  useEffect(() => abandonCover, [abandonCover]);

  const handleSlugChange = useCallback((value: string) => {
    slugTouchedRef.current = true;
    setSlug(value);
  }, []);

  const handleCoverUpload = useCallback(
    async (storageId: Id<"_storage">) => {
      // The ref tracks the in-flight upload too; state can still be stale.
      const previous = stagedCoverRef.current;
      if (previous && previous !== storageId) {
        void abandonStagedImage({ storageId: previous }).catch(() => {
          /* prior staged file may already be linked or deleted */
        });
      }
      // Take ownership before awaiting the URL: leaving during that request
      // must still abandon the just-uploaded file.
      stagedCoverRef.current = storageId;
      let url: string;
      try {
        url = await getStagedImageDownloadUrl({ storageId });
      } catch (error) {
        abandonCover();
        throw error;
      }
      setCoverPreviewUrl(url);
      showShareMessage("Cover photo added");
    },
    [
      abandonCover,
      abandonStagedImage,
      getStagedImageDownloadUrl,
      showShareMessage,
    ],
  );

  const handleCoverRemove = useCallback(async () => {
    const storageId = stagedCoverRef.current;
    stagedCoverRef.current = null;
    if (storageId) {
      await abandonStagedImage({ storageId });
    }
    setCoverPreviewUrl(null);
    showShareMessage("Cover photo removed");
  }, [abandonStagedImage, showShareMessage]);

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
    // Hand ownership to the mutation before it runs. If the page unmounts
    // mid-request, cleanup must not delete a file the mutation may have linked.
    const coverToLink = stagedCoverRef.current;
    stagedCoverRef.current = null;
    try {
      const id = await createCampaign({
        workspaceId,
        name: trimmed,
        slug: trimmedSlug,
        description: description.trim() || undefined,
        visibility,
        // Use the ref, not state: state lags while a cover URL is loading.
        imageStorageId: coverToLink ?? undefined,
      });
      showShareMessage("Campaign created");
      router.replace(`/admin/campaigns/${id}`);
    } catch (error) {
      // No campaign was created, so the file is still ours to clean up.
      if (coverToLink) stagedCoverRef.current = coverToLink;
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
    createCampaign,
    router,
    showShareMessage,
  ]);

  const handleCancel = useCallback(() => {
    abandonCover();
    router.push("/admin");
  }, [abandonCover, router]);

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

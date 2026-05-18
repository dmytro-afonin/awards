"use client";

import { api } from "@cvx/_generated/api";
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

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CampaignVisibility>("private");
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const slugTouchedRef = useRef(false);

  const handleSlugChange = useCallback((value: string) => {
    slugTouchedRef.current = true;
    setSlug(value);
  }, []);

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
            Set up the basics. Nothing is saved until you click Create. Add
            categories and a cover photo after the campaign exists.
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
            showCover
          />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 border-t border-border pt-6">
          <Button
            type="button"
            onClick={handleCreate}
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

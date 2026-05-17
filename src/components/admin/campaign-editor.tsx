"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { RiArrowLeftLine } from "@remixicon/react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { CampaignCategoriesEditor } from "@/components/admin/campaign-categories-editor";
import { LIFECYCLE_LABELS } from "@/components/admin/campaign-labels";
import { CampaignLifecycleActions } from "@/components/admin/campaign-lifecycle-actions";
import { CampaignLifecycleBadge } from "@/components/admin/campaign-lifecycle-badge";
import { CampaignVisibilityControls } from "@/components/admin/campaign-visibility-controls";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button, buttonVariants } from "@/components/ui/button";
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
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  canDeleteCampaign,
  normalizeCampaignLifecycle,
} from "@/lib/campaign-lifecycle";
import type { CampaignVisibility } from "@/lib/campaign-visibility";

type SaveIntent = "save_draft" | "mark_ready";

type CampaignEditorProps = {
  campaignId: Id<"campaigns">;
};

export function CampaignEditor({ campaignId }: CampaignEditorProps) {
  const router = useRouter();
  const { workspaceId, setSelectedCampaignId, showShareMessage } = useAdmin();

  const campaign = useQuery(api.campaigns.getForAdmin, { campaignId });

  const readiness = useQuery(api.campaignCategories.readinessSummary, {
    campaignId,
  });

  const updateCampaign = useMutation(api.campaigns.update);
  const setCampaignImage = useMutation(api.campaigns.setImage);
  const clearCampaignImage = useMutation(api.campaigns.clearImage);
  const removeCampaign = useMutation(api.campaigns.remove);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CampaignVisibility>("private");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const campaignLifecycle = campaign
    ? normalizeCampaignLifecycle(campaign.lifecycle)
    : null;

  const isReadyLocked = campaignLifecycle === "ready";
  const isTerminalLocked =
    campaignLifecycle === "launched" ||
    campaignLifecycle === "finished" ||
    campaignLifecycle === "deleted";
  const fieldsDisabled = isReadyLocked || isTerminalLocked || saving;

  const canDelete =
    campaign &&
    canDeleteCampaign(campaign.lifecycle) &&
    campaignLifecycle !== "deleted";

  const showDraftReadyActions =
    campaignLifecycle === "draft" || campaignLifecycle === "ready";

  useEffect(() => {
    setSelectedCampaignId(campaignId);
  }, [campaignId, setSelectedCampaignId]);

  useEffect(() => {
    if (campaign === undefined || campaign === null) {
      return;
    }
    setName(campaign.name);
    setSlug(campaign.slug);
    setDescription(campaign.description ?? "");
    setVisibility(campaign.visibility);
    setFormError(null);
  }, [campaign]);

  const persist = useCallback(
    async (intent: SaveIntent) => {
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
      if (intent === "mark_ready" && readiness && !readiness.canMarkReady) {
        setFormError(
          "Add at least one category with at least two nominees in each before marking as ready.",
        );
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
          intent,
        });
        showShareMessage(
          intent === "mark_ready"
            ? "Campaign marked as ready"
            : isReadyLocked
              ? "Reverted to draft"
              : "Campaign saved as draft",
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not save campaign.";
        setFormError(message || "Could not save campaign. Try again.");
      } finally {
        setSaving(false);
      }
    },
    [
      name,
      slug,
      description,
      visibility,
      workspaceId,
      campaignId,
      readiness,
      updateCampaign,
      showShareMessage,
      isReadyLocked,
    ],
  );

  const handleDelete = useCallback(async () => {
    if (!canDelete) return;
    if (
      !window.confirm(
        "Delete this campaign? It will be marked deleted and hidden from the list.",
      )
    ) {
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await removeCampaign({ campaignId });
      showShareMessage("Campaign deleted");
      startTransition(() => {
        router.push("/admin");
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete campaign.";
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }, [campaignId, canDelete, removeCampaign, router, showShareMessage]);

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
        <Skeleton className="h-64 w-full max-w-xl" />
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
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/admin" />}
        >
          <RiArrowLeftLine className="size-4" />
          Campaigns
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Campaign</CardTitle>
            <CampaignLifecycleBadge lifecycle={campaign.lifecycle} />
          </div>
          <CardDescription>
            {isReadyLocked
              ? "This campaign is ready and locked. Revert to draft to edit."
              : isTerminalLocked && campaignLifecycle
                ? `${LIFECYCLE_LABELS[campaignLifecycle]} campaigns cannot be edited here.`
                : "Save as draft or mark as ready when categories and nominees are set up."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field data-invalid={Boolean(formError && !name.trim())}>
              <FieldLabel htmlFor="campaign-name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="campaign-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q4 Engineering Awards"
                  disabled={fieldsDisabled}
                  aria-invalid={Boolean(formError && !name.trim())}
                  autoComplete="off"
                />
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(formError && !slug.trim())}>
              <FieldLabel htmlFor="campaign-slug">Slug</FieldLabel>
              <FieldContent>
                <Input
                  id="campaign-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. q4-engineering-awards"
                  disabled={fieldsDisabled}
                  aria-invalid={Boolean(formError && !slug.trim())}
                  autoComplete="off"
                />
                <FieldDescription>
                  URL-safe identifier, unique within this workspace.
                </FieldDescription>
              </FieldContent>
            </Field>

            <ImageUploadField
              label="Cover photo"
              description="Shown on the campaign list and cards. Cropped to 16:9."
              imageUrl={campaign.imageUrl}
              aspect={16 / 9}
              previewClassName="w-full"
              disabled={fieldsDisabled}
              onUpload={async (storageId) => {
                await setCampaignImage({ campaignId, storageId });
                showShareMessage("Cover photo updated");
              }}
              onRemove={async () => {
                await clearCampaignImage({ campaignId });
                showShareMessage("Cover photo removed");
              }}
            />

            <Field>
              <FieldLabel htmlFor="campaign-description">
                Description
              </FieldLabel>
              <FieldContent>
                <Textarea
                  id="campaign-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional short summary"
                  rows={4}
                  className="min-h-24 resize-y"
                  disabled={fieldsDisabled}
                />
              </FieldContent>
            </Field>

            <CampaignCategoriesEditor
              campaignId={campaignId}
              disabled={fieldsDisabled}
            />

            <Field>
              <FieldLabel>Visibility</FieldLabel>
              <FieldContent>
                <CampaignVisibilityControls
                  visibility={visibility}
                  onVisibilityChange={setVisibility}
                  disabled={fieldsDisabled}
                />
              </FieldContent>
            </Field>

            {formError ? <FieldError>{formError}</FieldError> : null}
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {showDraftReadyActions ? (
            isReadyLocked ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => persist("save_draft")}
                disabled={saving}
              >
                {saving ? "Saving…" : "Revert to draft"}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => persist("save_draft")}
                  disabled={saving || !name.trim()}
                >
                  {saving ? "Saving…" : "Save as draft"}
                </Button>
                <Button
                  type="button"
                  onClick={() => persist("mark_ready")}
                  disabled={
                    saving || !name.trim() || readiness?.canMarkReady === false
                  }
                >
                  {saving ? "Saving…" : "Mark as ready"}
                </Button>
              </>
            )
          ) : null}
          <CampaignLifecycleActions
            campaignId={campaignId}
            campaignName={campaign.name}
            lifecycle={campaign.lifecycle}
            disabled={saving}
            hideEdit
            onArchived={() => {
              startTransition(() => {
                router.push("/admin");
              });
            }}
          />
          {canDelete ? (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete
            </Button>
          ) : null}
          <Link
            href="/admin"
            className={buttonVariants({ variant: "outline" })}
          >
            Cancel
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

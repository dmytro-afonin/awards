"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import type { CampaignVisibility } from "@/components/admin/campaign-labels";
import { VISIBILITY_LABELS } from "@/components/admin/campaign-labels";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const textareaClassName = cn(
  "min-h-24 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
);

type CampaignEditorProps =
  | { mode: "new" }
  | { mode: "edit"; campaignId: Id<"campaigns"> };

export function CampaignEditor(props: CampaignEditorProps) {
  const router = useRouter();
  const { workspaceId, setSelectedCampaignId, showShareMessage } = useAdmin();

  const editCampaignId = props.mode === "edit" ? props.campaignId : null;

  const campaign = useQuery(
    api.campaigns.getForAdmin,
    editCampaignId ? { campaignId: editCampaignId } : "skip",
  );

  const createCampaign = useMutation(api.campaigns.create);
  const updateCampaign = useMutation(api.campaigns.update);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CampaignVisibility>("private");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (props.mode === "new") {
      setSelectedCampaignId(null);
    } else if (editCampaignId) {
      setSelectedCampaignId(editCampaignId);
    }
  }, [props.mode, editCampaignId, setSelectedCampaignId]);

  useEffect(() => {
    if (props.mode !== "edit" || campaign === undefined || campaign === null) {
      return;
    }
    setName(campaign.name);
    setDescription(campaign.description ?? "");
    setVisibility(campaign.visibility);
    setFormError(null);
  }, [props.mode, campaign]);

  const handleSave = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Campaign name is required.");
      return;
    }
    if (!workspaceId) {
      setFormError("Select a workspace in the sidebar first.");
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      if (props.mode === "new") {
        const id = await createCampaign({
          workspaceId,
          name: trimmed,
          description: description.trim() || undefined,
          visibility,
        });
        setSelectedCampaignId(id);
        showShareMessage("Campaign saved");
        startTransition(() => {
          router.replace(`/admin/campaigns/${id}`);
        });
      } else if (editCampaignId) {
        await updateCampaign({
          campaignId: editCampaignId,
          name: trimmed,
          description: description.trim() || undefined,
          visibility,
        });
        showShareMessage("Campaign saved");
      }
    } catch {
      setFormError("Could not save campaign. Try again.");
    } finally {
      setSaving(false);
    }
  }, [
    name,
    description,
    visibility,
    workspaceId,
    props.mode,
    editCampaignId,
    createCampaign,
    updateCampaign,
    router,
    setSelectedCampaignId,
    showShareMessage,
  ]);

  if (!workspaceId) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-sm text-muted-foreground">
          Select a workspace in the sidebar to create or edit campaigns.
        </p>
      </div>
    );
  }

  if (props.mode === "edit") {
    if (campaign === undefined) {
      return (
        <div className="p-4 md:p-6">
          <p className="text-sm text-muted-foreground">Loading campaign…</p>
        </div>
      );
    }
    if (campaign === null) {
      return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
          <p className="text-sm text-muted-foreground">
            This campaign could not be found, or you do not have admin access.
          </p>
          <Link
            href="/admin"
            className={buttonVariants({ variant: "outline" })}
          >
            Back to campaigns
          </Link>
        </div>
      );
    }
  }

  const title = props.mode === "new" ? "New campaign" : "Edit campaign";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <Link
          href="/admin"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-4" />
          Campaigns
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Set the campaign name, optional description, and visibility. Changes
            apply when you save.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q4 Engineering Awards"
              aria-invalid={Boolean(formError && !name.trim())}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Description</span>
            <textarea
              className={textareaClassName}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional short summary"
              rows={4}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Visibility</span>
            <Select
              value={visibility}
              onValueChange={(value) => {
                if (value === "public" || value === "private") {
                  setVisibility(value);
                }
              }}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  {VISIBILITY_LABELS.private}
                </SelectItem>
                <SelectItem value="public">
                  {VISIBILITY_LABELS.public}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {props.mode === "edit" && campaign ? (
            <p className="text-xs text-muted-foreground">
              Status: {campaign.lifecycle} · Slug:{" "}
              <span className="font-mono">{campaign.slug}</span>
            </p>
          ) : null}
          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
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

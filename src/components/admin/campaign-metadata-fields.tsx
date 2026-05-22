"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { slugifyName } from "@cvx/lib/slug";
import type { MutableRefObject } from "react";
import { CampaignVisibilityControls } from "@/components/admin/campaign-visibility-controls";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CampaignVisibility } from "@/lib/campaign-visibility";

export type CampaignMetadataValues = {
  name: string;
  slug: string;
  description: string;
  visibility: CampaignVisibility;
};

type CampaignMetadataFieldsProps = {
  values: CampaignMetadataValues;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onVisibilityChange: (value: CampaignVisibility) => void;
  disabled?: boolean;
  formError?: string | null;
  /** Auto-update slug from name until slug is touched manually */
  autoSlugFromName?: boolean;
  slugTouchedRef?: MutableRefObject<boolean>;
  workspaceId?: Id<"workspaces">;
  campaignId?: Id<"campaigns">;
  imageUrl?: string | null;
  onImageUpload?: (storageId: Id<"_storage">) => Promise<void>;
  onImageRemove?: () => Promise<void>;
  showCover?: boolean;
};

export function CampaignMetadataFields({
  values,
  onNameChange,
  onSlugChange,
  onDescriptionChange,
  onVisibilityChange,
  disabled = false,
  formError = null,
  autoSlugFromName = false,
  slugTouchedRef,
  workspaceId,
  campaignId,
  imageUrl,
  onImageUpload,
  onImageRemove,
  showCover = true,
}: CampaignMetadataFieldsProps) {
  const handleNameChange = (value: string) => {
    onNameChange(value);
    if (autoSlugFromName && slugTouchedRef && !slugTouchedRef.current) {
      onSlugChange(slugifyName(value));
    }
  };

  const coverProcessingTarget = campaignId
    ? { type: "campaign" as const, campaignId }
    : workspaceId
      ? { type: "workspace" as const, workspaceId }
      : null;

  return (
    <FieldGroup className="gap-4">
      <Field data-invalid={Boolean(formError && !values.name.trim())}>
        <FieldLabel htmlFor="campaign-name">Name</FieldLabel>
        <FieldContent>
          <Input
            id="campaign-name"
            value={values.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Q4 Engineering Awards"
            disabled={disabled}
            aria-invalid={Boolean(formError && !values.name.trim())}
            autoComplete="off"
          />
        </FieldContent>
      </Field>

      <Field data-invalid={Boolean(formError && !values.slug.trim())}>
        <FieldLabel htmlFor="campaign-slug">Slug</FieldLabel>
        <FieldContent>
          <Input
            id="campaign-slug"
            value={values.slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="e.g. q4-engineering-awards"
            disabled={disabled}
            aria-invalid={Boolean(formError && !values.slug.trim())}
            autoComplete="off"
          />
          <FieldDescription>
            URL-safe identifier, unique within this workspace.
          </FieldDescription>
        </FieldContent>
      </Field>

      {showCover && coverProcessingTarget && onImageUpload && onImageRemove ? (
        <ImageUploadField
          label="Cover photo"
          description="Shown on the campaign list and cards. Cropped to 16:9."
          imageUrl={imageUrl ?? undefined}
          aspect={16 / 9}
          previewClassName="w-full max-w-xs"
          disabled={disabled}
          processingTarget={coverProcessingTarget}
          onUpload={onImageUpload}
          onRemove={onImageRemove}
        />
      ) : null}

      <Field>
        <FieldLabel htmlFor="campaign-description">Description</FieldLabel>
        <FieldContent>
          <Textarea
            id="campaign-description"
            value={values.description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Optional short summary"
            rows={4}
            className="min-h-24 resize-y"
            disabled={disabled}
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>Visibility</FieldLabel>
        <FieldContent>
          <CampaignVisibilityControls
            visibility={values.visibility}
            onVisibilityChange={onVisibilityChange}
            disabled={disabled}
          />
        </FieldContent>
      </Field>

      {formError ? <FieldError>{formError}</FieldError> : null}
    </FieldGroup>
  );
}

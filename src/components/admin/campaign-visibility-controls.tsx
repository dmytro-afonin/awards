"use client";

import { CampaignVisibilityGlyph } from "@/components/campaign-visibility";
import { FieldDescription } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  type CampaignVisibility,
  VISIBILITY_DESCRIPTION,
  VISIBILITY_LABELS,
} from "@/lib/campaign-visibility";

type CampaignVisibilityControlsProps = {
  visibility: CampaignVisibility;
  onVisibilityChange: (visibility: CampaignVisibility) => void;
  disabled?: boolean;
};

export function CampaignVisibilityControls({
  visibility,
  onVisibilityChange,
  disabled,
}: CampaignVisibilityControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      <ToggleGroup
        variant="outline"
        spacing={0}
        disabled={disabled}
        value={[visibility]}
        onValueChange={(values) => {
          const next = values[0];
          if (next === "public" || next === "private") {
            onVisibilityChange(next);
          }
        }}
      >
        <ToggleGroupItem value="private" className="gap-1.5 px-3">
          <CampaignVisibilityGlyph visibility="private" withSurface />
          {VISIBILITY_LABELS.private}
        </ToggleGroupItem>
        <ToggleGroupItem value="public" className="gap-1.5 px-3">
          <CampaignVisibilityGlyph visibility="public" withSurface />
          {VISIBILITY_LABELS.public}
        </ToggleGroupItem>
      </ToggleGroup>
      <FieldDescription>{VISIBILITY_DESCRIPTION[visibility]}</FieldDescription>
    </div>
  );
}

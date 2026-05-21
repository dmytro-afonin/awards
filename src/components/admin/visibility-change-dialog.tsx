"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { normalizeCampaignLifecycle } from "@/lib/campaign-lifecycle";
import type { CampaignVisibility } from "@/lib/campaign-visibility";
import {
  VISIBILITY_DESCRIPTION,
  VISIBILITY_LABELS,
} from "@/lib/campaign-visibility";

type VisibilityChangeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from: CampaignVisibility;
  to: CampaignVisibility;
  lifecycle: string;
  onConfirm: () => void;
};

function lifecycleContext(lifecycle: string): string | null {
  const state = normalizeCampaignLifecycle(lifecycle);
  if (
    state === "launched" ||
    state === "vote_live" ||
    state === "vote_ended" ||
    state === "finished"
  ) {
    return "This change takes effect immediately for anyone viewing the campaign.";
  }
  if (state === "draft") {
    return "This applies when the campaign is launched.";
  }
  return null;
}

export function VisibilityChangeDialog({
  open,
  onOpenChange,
  from,
  to,
  lifecycle,
  onConfirm,
}: VisibilityChangeDialogProps) {
  const context = lifecycleContext(lifecycle);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 supports-backdrop-filter:backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">
            Change visibility?
          </Dialog.Title>
          <Dialog.Description
            render={
              <div className="mt-2 space-y-2 text-sm text-muted-foreground" />
            }
          >
            <p>
              Switch from <strong>{VISIBILITY_LABELS[from]}</strong> to{" "}
              <strong>{VISIBILITY_LABELS[to]}</strong>.
            </p>
            <p>{VISIBILITY_DESCRIPTION[to]}</p>
            {to === "public" ? (
              <p>
                Anyone will be able to view this campaign once it is launched.
                Voting still requires sign-in.
              </p>
            ) : (
              <p>Only workspace members will be able to view this campaign.</p>
            )}
            {context ? <p>{context}</p> : null}
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              Change visibility
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

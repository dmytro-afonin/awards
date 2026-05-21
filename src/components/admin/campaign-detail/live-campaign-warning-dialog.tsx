"use client";

import { Dialog } from "@base-ui/react/dialog";
import { RiAlertLine } from "@remixicon/react";
import { CampaignLifecycleBadge } from "@/components/admin/campaign-lifecycle-badge";
import { Button } from "@/components/ui/button";
import { lifecycleLabel } from "@/lib/campaign-lifecycle";

type LiveCampaignWarningDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  lifecycle: string;
  title: string;
  summary?: string;
  bullets: string[];
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
};

export function LiveCampaignWarningDialog({
  open,
  onOpenChange,
  campaignName,
  lifecycle,
  title,
  summary = "Changes apply immediately",
  bullets,
  confirmLabel,
  onConfirm,
}: LiveCampaignWarningDialogProps) {
  const status = lifecycleLabel(lifecycle);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-6 py-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-200">
                <RiAlertLine className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <Dialog.Title className="text-lg font-semibold leading-tight">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {campaignName}
                  </span>{" "}
                  is currently{" "}
                  <span className="font-medium text-foreground">{status}</span>.
                </Dialog.Description>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            <CampaignLifecycleBadge lifecycle={lifecycle} />

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{summary}</p>
              <ul className="list-disc space-y-1.5 pl-5">
                {bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/30 px-6 py-4 sm:flex-row sm:justify-end">
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
                void (async () => {
                  try {
                    await onConfirm();
                    onOpenChange(false);
                  } catch {
                    // Keep dialog open so the admin can retry.
                  }
                })();
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

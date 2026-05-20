"use client";

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

export const CAMPAIGN_RUN_VARIANTS = [
  {
    id: "A",
    name: "Show Director",
    tagline: "Ordered rail + single focus card",
  },
  {
    id: "B",
    name: "Stage timeline",
    tagline: "Horizontal stepper drives focus",
  },
  {
    id: "C",
    name: "Lead / Overview",
    tagline: "Preferred — rail + tabs, split actions",
  },
  {
    id: "D",
    name: "Action queue",
    tagline: "One big CTA + jump palette",
  },
] as const;

export type CampaignRunVariantId = (typeof CAMPAIGN_RUN_VARIANTS)[number]["id"];

function cycleVariant(
  current: CampaignRunVariantId,
  direction: 1 | -1,
): CampaignRunVariantId {
  const ids = CAMPAIGN_RUN_VARIANTS.map((v) => v.id);
  const index = ids.indexOf(current);
  const next = (index + direction + ids.length) % ids.length;
  return ids[next] ?? "A";
}

export function parseCampaignRunVariant(
  raw: string | null,
): CampaignRunVariantId {
  if (raw === "B" || raw === "C" || raw === "D") return raw;
  return "A";
}

export function CampaignRunVariantSwitcher({
  current,
}: {
  current: CampaignRunVariantId;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meta =
    CAMPAIGN_RUN_VARIANTS.find((v) => v.id === current) ??
    CAMPAIGN_RUN_VARIANTS[0];

  const setVariant = useCallback(
    (next: CampaignRunVariantId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("variant", next);
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const cycle = useCallback(
    (direction: 1 | -1) => {
      setVariant(cycleVariant(current, direction));
    },
    [current, setVariant],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        cycle(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        cycle(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cycle]);

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4"
      role="toolbar"
      aria-label="Campaign run prototype switcher"
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-950/95 px-2 py-1.5 text-amber-50 shadow-lg backdrop-blur-md">
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-full hover:bg-amber-800/60"
          onClick={() => cycle(-1)}
          aria-label="Previous variant"
        >
          <RiArrowLeftSLine className="size-5" />
        </button>
        <div className="min-w-[12rem] px-2 text-center text-xs">
          <span className="font-semibold uppercase tracking-wider">
            {meta.id} — {meta.name}
          </span>
          <span className="mt-0.5 block text-[10px] text-amber-200/85">
            {meta.tagline}
          </span>
        </div>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-full hover:bg-amber-800/60"
          onClick={() => cycle(1)}
          aria-label="Next variant"
        >
          <RiArrowRightSLine className="size-5" />
        </button>
      </div>
    </div>
  );
}

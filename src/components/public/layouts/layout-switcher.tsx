"use client";

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  cyclePublicLayout,
  PUBLIC_LAYOUT_META,
  type PublicLayoutId,
} from "@/lib/public-layout";
import { usePublicLayout } from "./use-public-layout";

export function PublicLayoutSwitcher() {
  const layout = usePublicLayout();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setLayout = useCallback(
    (next: PublicLayoutId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("layout", next);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const cycle = useCallback(
    (direction: 1 | -1) => {
      setLayout(cyclePublicLayout(layout, direction));
    },
    [layout, setLayout],
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

  const meta = PUBLIC_LAYOUT_META[layout];

  return (
    <div
      className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none"
      role="toolbar"
      aria-label="Layout prototype switcher"
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-950/90 px-2 py-1.5 text-amber-50 shadow-lg backdrop-blur-md dark:bg-amber-950/95">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-amber-50 hover:bg-amber-800/50 hover:text-amber-50"
          onClick={() => cycle(-1)}
          aria-label="Previous layout"
        >
          <RiArrowLeftSLine className="size-5" />
        </Button>
        <div className="min-w-[10rem] px-2 text-center text-xs">
          <span className="font-semibold uppercase tracking-wider">
            {meta.label}
          </span>
          <span className="mt-0.5 block text-[10px] text-amber-200/80">
            {meta.tagline}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-amber-50 hover:bg-amber-800/50 hover:text-amber-50"
          onClick={() => cycle(1)}
          aria-label="Next layout"
        >
          <RiArrowRightSLine className="size-5" />
        </Button>
      </div>
    </div>
  );
}

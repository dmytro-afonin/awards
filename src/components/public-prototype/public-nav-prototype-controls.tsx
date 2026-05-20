"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  PUBLIC_NAV_VARIANTS,
  type PublicNavVariantId,
} from "@/components/public-prototype/prototype-variant-switcher";
import type { NavContext } from "@/components/public-prototype/public-nav-mock";
import { cn } from "@/lib/utils";

export function PublicNavPrototypeControls({
  variant,
  context,
  onContextChange,
}: {
  variant: PublicNavVariantId;
  context: NavContext;
  onContextChange: (next: NavContext) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setVariant = useCallback(
    (next: PublicNavVariantId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("variant", next);
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[200] border-b-4 border-fuchsia-400 bg-fuchsia-950 text-fuchsia-50 shadow-2xl">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <p className="text-center text-sm font-bold uppercase tracking-widest text-fuchsia-200">
          Prototype controls — not part of the design
        </p>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-fuchsia-300">
          1. Pick a navigation design
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PUBLIC_NAV_VARIANTS.map((v) => {
            const selected = variant === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                className={cn(
                  "rounded-lg border-2 px-3 py-3 text-left transition-colors",
                  selected
                    ? "border-white bg-fuchsia-600 text-white"
                    : "border-fuchsia-600/60 bg-fuchsia-900/80 text-fuchsia-100 hover:border-fuchsia-300 hover:bg-fuchsia-800",
                )}
                aria-pressed={selected}
              >
                <span className="block text-base font-bold">
                  {v.id} — {v.name}
                </span>
                <span className="mt-1 block text-[11px] leading-snug opacity-90">
                  {v.tagline}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-fuchsia-300">
          2. Site vs campaign navigation
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => onContextChange("site")}
            className={cn(
              "flex-1 rounded-lg border-2 py-2.5 text-sm font-bold",
              context === "site"
                ? "border-white bg-white text-fuchsia-950"
                : "border-fuchsia-600/60 bg-fuchsia-900/80 hover:bg-fuchsia-800",
            )}
            aria-pressed={context === "site"}
          >
            Site pages
          </button>
          <button
            type="button"
            onClick={() => onContextChange("campaign")}
            className={cn(
              "flex-1 rounded-lg border-2 py-2.5 text-sm font-bold",
              context === "campaign"
                ? "border-white bg-white text-fuchsia-950"
                : "border-fuchsia-600/60 bg-fuchsia-900/80 hover:bg-fuchsia-800",
            )}
            aria-pressed={context === "campaign"}
          >
            Inside a campaign
          </button>
        </div>
      </div>
    </div>
  );
}

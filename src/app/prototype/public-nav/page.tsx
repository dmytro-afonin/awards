"use client";

/**
 * PROTOTYPE — Three public navigation shells (site + campaign context).
 * Open /prototype/public-nav — use the magenta bar at the top to switch designs.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";
import { NavVariantArena } from "@/components/public-prototype/nav-variant-arena";
import { NavVariantFestival } from "@/components/public-prototype/nav-variant-festival";
import { NavVariantSpotlight } from "@/components/public-prototype/nav-variant-spotlight";
import type { PublicNavVariantId } from "@/components/public-prototype/prototype-variant-switcher";
import type { NavContext } from "@/components/public-prototype/public-nav-mock";
import { PublicNavPrototypeControls } from "@/components/public-prototype/public-nav-prototype-controls";

function parseVariant(raw: string | null): PublicNavVariantId {
  if (raw === "B" || raw === "C") return raw;
  return "A";
}

function PublicNavPrototypeInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const variant = parseVariant(searchParams.get("variant"));
  const [context, setContext] = useState<NavContext>("site");

  const setContextParam = useCallback(
    (next: NavContext) => {
      setContext(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set("context", next);
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <>
      <PublicNavPrototypeControls
        variant={variant}
        context={context}
        onContextChange={setContextParam}
      />

      {/* Space for fixed prototype toolbar */}
      <div className="pt-[15.5rem] sm:pt-[13.5rem]">
        {variant === "A" ? <NavVariantArena context={context} /> : null}
        {variant === "B" ? <NavVariantFestival context={context} /> : null}
        {variant === "C" ? <NavVariantSpotlight context={context} /> : null}
      </div>
    </>
  );
}

export default function PublicNavPrototypePage() {
  return (
    <Suspense fallback={null}>
      <PublicNavPrototypeInner />
    </Suspense>
  );
}

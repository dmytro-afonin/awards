"use client";

import { useSearchParams } from "next/navigation";
import { type PublicLayoutId, parsePublicLayout } from "@/lib/public-layout";

/** Active layout: explicit ?layout= or classic when omitted. */
export function usePublicLayout(): PublicLayoutId {
  const searchParams = useSearchParams();
  return parsePublicLayout(searchParams.get("layout")) ?? "classic";
}

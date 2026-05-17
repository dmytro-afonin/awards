"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";

/** One-time per workspace session: persist `started` / `live` → `launched` in the DB. */
export function useNormalizeLegacyLifecycles(
  workspaceId: Id<"workspaces"> | null,
) {
  const normalizeLegacyLifecycles = useMutation(
    api.campaigns.normalizeLegacyLifecycles,
  );
  const normalizedWorkspaces = useRef(new Set<string>());

  useEffect(() => {
    if (!workspaceId) return;
    if (normalizedWorkspaces.current.has(workspaceId)) return;

    normalizedWorkspaces.current.add(workspaceId);
    void normalizeLegacyLifecycles({ workspaceId }).catch(() => {
      normalizedWorkspaces.current.delete(workspaceId);
    });
  }, [workspaceId, normalizeLegacyLifecycles]);
}

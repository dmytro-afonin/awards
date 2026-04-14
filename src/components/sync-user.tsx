"use client";

import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "@cvx/_generated/api";

/**
 * Wait for Convex to receive a valid Clerk JWT before calling mutations that use ctx.auth.
 * Clerk `isSignedIn` alone is not enough — the token must be passed to Convex first.
 */
export function SyncUser() {
  const { userId } = useAuth();
  const { isLoading: convexAuthLoading, isAuthenticated } = useConvexAuth();
  const sync = useMutation(api.users.sync);
  const lastSyncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      lastSyncedUserId.current = null;
      return;
    }
    if (convexAuthLoading || !isAuthenticated) return;
    if (lastSyncedUserId.current === userId) return;
    lastSyncedUserId.current = userId;
    void sync().catch(() => {
      lastSyncedUserId.current = null;
    });
  }, [convexAuthLoading, isAuthenticated, userId, sync]);

  return null;
}

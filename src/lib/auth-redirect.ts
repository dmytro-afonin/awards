"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";

/** Path + query only, for `redirect_url` query params (host resolved on the auth page). */
export function toRedirectPath(redirectUrl: string | null | undefined): string {
  if (!redirectUrl?.trim()) {
    return "/";
  }
  const trimmed = redirectUrl.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "/";
  }
}

/** Turn a relative or same-origin redirect into a full URL on the current host. */
export function resolveAuthRedirectUrl(
  redirectUrl: string | null | undefined,
  origin: string,
): string {
  const fallback = `${origin}/`;
  if (!redirectUrl?.trim()) {
    return fallback;
  }

  const trimmed = redirectUrl.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return `${origin}${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.origin === new URL(origin).origin) {
      return parsed.href;
    }
  } catch {
    // Invalid URL — fall through to fallback.
  }

  return fallback;
}

export function buildSignInPageHref(redirectPath: string): string {
  const params = new URLSearchParams({
    redirect_url: toRedirectPath(redirectPath),
  });
  return `/sign-in?${params.toString()}`;
}

export function buildSignUpPageHref(redirectPath: string): string {
  const params = new URLSearchParams({
    redirect_url: toRedirectPath(redirectPath),
  });
  return `/sign-up?${params.toString()}`;
}

/** Absolute URL for the current page — used for Clerk `forceRedirectUrl` after OAuth. */
export function useAuthRedirectTarget(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const path = `${pathname}${search ? `?${search}` : ""}`;

  return useSyncExternalStore(
    () => () => {},
    () => resolveAuthRedirectUrl(path, window.location.origin),
    () => resolveAuthRedirectUrl(path, "http://localhost"),
  );
}

"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense, useSyncExternalStore } from "react";
import {
  buildSignInPageHref,
  resolveAuthRedirectUrl,
  toRedirectPath,
} from "@/lib/auth-redirect";

function SignUpForm() {
  const search = useSearchParams();
  const rawRedirect = search.get("redirect_url") ?? "/";
  const redirectPath = toRedirectPath(rawRedirect);
  const redirectUrl = useSyncExternalStore(
    () => () => {},
    () => resolveAuthRedirectUrl(rawRedirect, window.location.origin),
    () => resolveAuthRedirectUrl(rawRedirect, "http://localhost"),
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl={buildSignInPageHref(redirectPath)}
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
        signInForceRedirectUrl={redirectUrl}
        signInFallbackRedirectUrl={redirectUrl}
      />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-zinc-500">
          Loading…
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}

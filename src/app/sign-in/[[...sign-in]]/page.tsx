"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense, useSyncExternalStore } from "react";
import {
  buildSignUpPageHref,
  resolveAuthRedirectUrl,
  toRedirectPath,
} from "@/lib/auth-redirect";

function SignInForm() {
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
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl={buildSignUpPageHref(redirectPath)}
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
        signUpForceRedirectUrl={redirectUrl}
        signUpFallbackRedirectUrl={redirectUrl}
      />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-zinc-500">
          Loading…
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}

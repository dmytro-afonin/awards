"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInForm() {
  const search = useSearchParams();
  const redirectUrl = search.get("redirect_url") ?? "/";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl={redirectUrl}
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

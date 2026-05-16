"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignUpForm() {
  const search = useSearchParams();
  const redirectUrl = search.get("redirect_url") ?? "/";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
        fallbackRedirectUrl={redirectUrl}
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

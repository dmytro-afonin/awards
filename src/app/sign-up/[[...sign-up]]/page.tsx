"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const search = useSearchParams();
  const redirectUrl = search.get("redirect_url") ?? "/dashboard";

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

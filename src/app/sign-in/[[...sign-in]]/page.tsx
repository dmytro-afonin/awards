"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const search = useSearchParams();
  const redirectUrl = search.get("redirect_url") ?? "/dashboard";

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

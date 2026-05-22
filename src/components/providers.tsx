"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ReactNode } from "react";
import { ConfirmDialogProvider } from "@/components/confirm-dialog-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const convex =
  convexUrl && convexUrl.length > 0 ? new ConvexReactClient(convexUrl) : null;

export function Providers({ children }: { children: ReactNode }) {
  if (!clerkKey || !convex) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-sm text-zinc-600">
          Missing{" "}
          <code className="font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
          or <code className="font-mono">NEXT_PUBLIC_CONVEX_URL</code>. Copy{" "}
          <code className="font-mono">.env.example</code> to{" "}
          <code className="font-mono">.env.local</code> and run{" "}
          <code className="font-mono">bunx convex dev</code>.
        </p>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkKey} afterSignOutUrl="/">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ConfirmDialogProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ConfirmDialogProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

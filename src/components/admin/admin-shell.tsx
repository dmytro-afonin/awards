"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { AdminProvider } from "@/components/admin/admin-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { buildSignInPageHref } from "@/lib/auth-redirect";

function AdminShellInner({ children }: { children?: ReactNode }) {
  return (
    <TooltipProvider>
      {/* Lock viewport height so only the main pane scrolls; header stays put. */}
      <SidebarProvider className="flex h-svh max-h-svh min-h-0 overflow-hidden">
        <AdminSidebar />
        <SidebarInset className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AdminTopBar />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

function AdminAuthGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      const returnPath = `${window.location.pathname}${window.location.search}`;
      router.replace(buildSignInPageHref(returnPath));
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-svh items-center justify-center text-sm text-muted-foreground">
        {isLoaded ? "Redirecting to sign in…" : "Loading…"}
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminShell({ children }: { children?: ReactNode }) {
  return (
    <AdminAuthGate>
      <AdminProvider>
        <AdminShellInner>{children}</AdminShellInner>
      </AdminProvider>
    </AdminAuthGate>
  );
}

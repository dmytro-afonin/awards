"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { AdminProvider } from "@/components/admin/admin-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

function AdminShellInner({ children }: { children?: ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-dvh">
        <AdminSidebar />
        <SidebarInset className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AdminTopBar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {children}
            </div>
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
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
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

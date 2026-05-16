"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { AdminProvider, useAdmin } from "@/components/admin/admin-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { CampaignsView } from "@/components/admin/campaigns-view";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function AdminShellInner({ children }: { children?: ReactNode }) {
  const { mobileNavOpen, setMobileNavOpen } = useAdmin();

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AdminSidebar className="hidden lg:flex" />
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <AdminSidebar className="h-full w-full border-0" />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto">
          {children ?? <CampaignsView />}
        </main>
      </div>
    </div>
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

"use client";

import type { ReactNode } from "react";
import { CampaignNotFound } from "@/components/public/campaign-not-found";
import { PublicShell } from "@/components/public/public-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CampaignLoading({ className }: { className?: string }) {
  return (
    <PublicShell className={className}>
      <Skeleton className="mb-6 h-48 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </PublicShell>
  );
}

export function CategoryLoading({ className }: { className?: string }) {
  return (
    <PublicShell className={className}>
      <Skeleton className="mb-4 h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </PublicShell>
  );
}

export function PageGate({
  loading,
  notFound,
  children,
  loadingFallback,
  className,
}: {
  loading: boolean;
  notFound: boolean;
  children: ReactNode;
  loadingFallback?: ReactNode;
  className?: string;
}) {
  if (loading) {
    return loadingFallback ?? <CampaignLoading className={className} />;
  }
  if (notFound) {
    return <CampaignNotFound />;
  }
  return children;
}

export function VariantFrame({
  children,
  className,
  wide,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <PublicShell
      className={cn(wide && "max-w-7xl", "pb-24 md:pb-28", className)}
    >
      {children}
    </PublicShell>
  );
}

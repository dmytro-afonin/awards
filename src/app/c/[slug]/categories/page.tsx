"use client";

import { Suspense, use } from "react";
import { PublicCategoriesPage } from "@/components/public/public-categories-page";
import { PublicShell } from "@/components/public/public-shell";
import { Skeleton } from "@/components/ui/skeleton";

type PublicCategoriesRouteProps = {
  params: Promise<{ slug: string }>;
};

function CategoriesPageFallback() {
  return (
    <PublicShell>
      <Skeleton className="mb-4 h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </PublicShell>
  );
}

function CategoriesRouteInner({ params }: PublicCategoriesRouteProps) {
  const { slug } = use(params);
  return <PublicCategoriesPage slug={slug} />;
}

export default function CategoriesRoute({
  params,
}: PublicCategoriesRouteProps) {
  return (
    <Suspense fallback={<CategoriesPageFallback />}>
      <CategoriesRouteInner params={params} />
    </Suspense>
  );
}

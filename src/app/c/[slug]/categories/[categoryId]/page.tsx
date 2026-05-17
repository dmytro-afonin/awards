"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { Suspense, use } from "react";
import { PublicCategoryPage } from "@/components/public/public-category-page";
import { PublicShell } from "@/components/public/public-shell";
import { Skeleton } from "@/components/ui/skeleton";

type PublicCategoryRouteProps = {
  params: Promise<{ slug: string; categoryId: string }>;
};

function CategoryPageFallback() {
  return (
    <PublicShell>
      <Skeleton className="mb-4 h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    </PublicShell>
  );
}

export default function CategoryRoute({ params }: PublicCategoryRouteProps) {
  const { slug, categoryId } = use(params);
  return (
    <Suspense fallback={<CategoryPageFallback />}>
      <PublicCategoryPage
        slug={slug}
        categoryId={categoryId as Id<"campaignCategories">}
      />
    </Suspense>
  );
}

"use client";

import { Suspense, use } from "react";
import { PublicNomineesPage } from "@/components/public/public-nominees-page";
import { PublicShell } from "@/components/public/public-shell";
import { Skeleton } from "@/components/ui/skeleton";

type NomineesRouteProps = {
  params: Promise<{ slug: string }>;
};

function NomineesFallback() {
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

function NomineesRouteInner({ params }: NomineesRouteProps) {
  const { slug } = use(params);
  return <PublicNomineesPage slug={slug} />;
}

export default function NomineesRoute({ params }: NomineesRouteProps) {
  return (
    <Suspense fallback={<NomineesFallback />}>
      <NomineesRouteInner params={params} />
    </Suspense>
  );
}

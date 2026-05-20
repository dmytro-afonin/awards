"use client";

import { type ReactNode, Suspense } from "react";
import { PublicHeader } from "@/components/public/public-header";
import { cn } from "@/lib/utils";

function PublicHeaderFallback() {
  return (
    <header className="sticky top-0 z-40 border-b border-amber-500/30 bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-4">
        <span className="font-heading text-lg font-bold uppercase tracking-[0.35em] text-amber-400">
          Awards
        </span>
      </div>
    </header>
  );
}

export function PublicShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Suspense fallback={<PublicHeaderFallback />}>
        <PublicHeader />
      </Suspense>
      <main
        className={cn(
          "mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}

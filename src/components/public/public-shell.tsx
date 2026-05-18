"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import type { ReactNode } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PublicShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 md:px-6">
          <Link
            href="/"
            className="font-heading text-sm font-semibold tracking-wide text-foreground no-underline"
          >
            Awards
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            {isLoaded && !isSignedIn ? (
              <Link
                href="/sign-in"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Sign in
              </Link>
            ) : null}
            {isLoaded && isSignedIn ? <UserButton /> : null}
          </div>
        </div>
      </header>
      <main
        className={cn("mx-auto w-full max-w-5xl px-4 py-8 md:px-6", className)}
      >
        {children}
      </main>
    </div>
  );
}

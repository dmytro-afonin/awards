"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="font-semibold text-foreground">Awards</span>
        <div className="flex items-center gap-3">
          <ModeToggle />
          {isLoaded && !isSignedIn ? (
            <SignInButton mode="modal">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign in
              </button>
            </SignInButton>
          ) : null}
          {isLoaded && isSignedIn ? <UserButton /> : null}
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Awards
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Convex and Clerk are wired up. Product work continues from{" "}
          <code className="rounded-none bg-muted px-1.5 py-0.5 text-sm text-foreground">
            docs.md
          </code>{" "}
          and the{" "}
          <code className="rounded-none bg-muted px-1.5 py-0.5 text-sm text-foreground">
            docs/
          </code>{" "}
          folder.
        </p>
        {isLoaded && !isSignedIn ? (
          <p className="mt-6">
            <Link
              href="/sign-in"
              className="rounded-none bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
            >
              Go to sign-in
            </Link>
          </p>
        ) : null}
        {isLoaded && isSignedIn ? (
          <p className="mt-6">
            <Link
              href="/admin"
              className="rounded-none bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Open admin
            </Link>
          </p>
        ) : null}
      </main>
    </div>
  );
}

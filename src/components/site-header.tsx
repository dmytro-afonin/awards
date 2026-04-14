"use client";

import Link from "next/link";
import { ClerkLoaded, ClerkLoading, UserButton, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-2 text-sm transition ${
        active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const onDashboard = pathname.startsWith("/dashboard");
  const onHome = pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight text-white">
            Awards
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/" label="Home" active={onHome} />
            <NavLink href="/#campaigns" label="Campaigns" active={!onDashboard && !onHome} />
            <NavLink href="/dashboard" label="Dashboard" active={onDashboard} />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ClerkLoading>
            <div className="h-9 w-24 animate-pulse rounded-full bg-white/5" />
          </ClerkLoading>
          <ClerkLoaded>
            {isLoaded && isSignedIn ? (
              <>
              <Link
                href="/dashboard/campaigns/new"
                className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
              >
                New campaign
              </Link>
              <UserButton />
              </>
            ) : (
              <Link
                href="/sign-in"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
              >
                Sign in
              </Link>
            )}
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
}

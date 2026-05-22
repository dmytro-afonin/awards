"use client";

import { SignInButton, SignOutButton, useAuth, useClerk } from "@clerk/nextjs";
import { api } from "@cvx/_generated/api";
import {
  RiArrowDownSLine,
  RiUser3Line,
  RiUserSettingsLine,
} from "@remixicon/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuthRedirectTarget } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";

export function PublicUserMenu() {
  const { isLoaded, isSignedIn } = useAuth();
  const { openUserProfile } = useClerk();
  const redirectTarget = useAuthRedirectTarget();
  const workspaces = useQuery(api.workspaces.listForViewer);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const canAccessAdmin =
    workspaces?.some((workspace) => workspace.canAccessAdmin) ?? false;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (!isLoaded) {
    return (
      <div
        className="h-8 w-24 animate-pulse border border-amber-500/20 bg-amber-500/5"
        aria-hidden
      />
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton
        mode="modal"
        forceRedirectUrl={redirectTarget}
        signUpForceRedirectUrl={redirectTarget}
      >
        <button
          type="button"
          className="flex items-center gap-2 border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300 hover:bg-amber-500/20"
        >
          <RiUser3Line className="size-4" />
          Sign in
        </button>
      </SignInButton>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300 hover:bg-amber-500/20"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <RiUser3Line className="size-4" />
        Account
        <RiArrowDownSLine className="size-4" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-[11rem] border border-amber-500/30 bg-zinc-900 py-1 shadow-xl"
        >
          <Link
            href="/my-votes"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-zinc-200 hover:bg-amber-500/10 hover:text-amber-300"
            onClick={() => setOpen(false)}
          >
            My votes
          </Link>
          {canAccessAdmin ? (
            <Link
              href="/admin"
              role="menuitem"
              className="block border-t border-zinc-800 px-4 py-2.5 text-sm text-zinc-200 hover:bg-amber-500/10 hover:text-amber-300"
              onClick={() => setOpen(false)}
            >
              My campaigns
              <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-500/80">
                Admin
              </span>
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className={cn(
              "flex w-full items-center gap-2 border-t border-zinc-800 px-4 py-2.5 text-left text-sm text-zinc-200",
              "hover:bg-amber-500/10 hover:text-amber-300",
            )}
            onClick={() => {
              setOpen(false);
              openUserProfile();
            }}
          >
            <RiUserSettingsLine className="size-4 shrink-0" />
            Manage account
          </button>
          <div className="border-t border-zinc-800">
            <SignOutButton>
              <button
                type="button"
                role="menuitem"
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm text-zinc-400",
                  "hover:bg-amber-500/10 hover:text-amber-300",
                )}
                onClick={() => setOpen(false)}
              >
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

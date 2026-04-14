"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "@cvx/_generated/api";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const redeem = useMutation(api.invites.redeemInvite);
  const [err, setErr] = useState<string | null>(null);
  const { isLoaded, isSignedIn } = useAuth();
  const ran = useRef(false);
  const sentToSignIn = useRef(false);

  useEffect(() => {
    if (!isLoaded || isSignedIn || sentToSignIn.current) return;
    sentToSignIn.current = true;
    router.replace(`/sign-in?redirect_url=${encodeURIComponent(`/join/${token}`)}`);
  }, [isLoaded, isSignedIn, router, token]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || ran.current) return;
    ran.current = true;
    let cancelled = false;
    (async () => {
      try {
        const { campaignId } = await redeem({ token });
        if (!cancelled) router.replace(`/dashboard/campaigns/${campaignId}`);
      } catch (e: unknown) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Could not redeem invite");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, token, redeem, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Redirecting to sign in…
      </div>
    );
  }

  if (err) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-red-400">{err}</p>
        <Link href="/dashboard" className="text-amber-500 hover:underline">
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-zinc-500">
      Joining campaign…
    </div>
  );
}

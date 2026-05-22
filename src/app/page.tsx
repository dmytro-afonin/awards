"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { PublicShell } from "@/components/public/public-shell";
import { PublicSitePage } from "@/components/public/public-site-page";
import { useAuthRedirectTarget } from "@/lib/auth-redirect";

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const redirectTarget = useAuthRedirectTarget();

  return (
    <PublicShell>
      <section className="relative overflow-hidden border-b border-zinc-800 -mx-4 px-4 py-16 md:-mx-6 md:px-6 md:py-24 lg:-mx-8 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/15 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,191,36,0.18),transparent_55%)]" />
        <div className="relative text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-500">
            Public awards hub
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
            The awards experience
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-zinc-400">
            Discover campaigns, follow the news, and cast your votes when voting
            opens.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/campaigns"
              className="bg-amber-500 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-950 no-underline hover:bg-amber-400"
            >
              Explore campaigns
            </Link>
            {isLoaded && !isSignedIn ? (
              <SignInButton
                mode="modal"
                forceRedirectUrl={redirectTarget}
                signUpForceRedirectUrl={redirectTarget}
              >
                <button
                  type="button"
                  className="border border-zinc-600 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 hover:border-amber-500/50 hover:text-amber-300"
                >
                  Sign in to vote
                </button>
              </SignInButton>
            ) : null}
          </div>
        </div>
      </section>

      <PublicSitePage
        title="Coming soon"
        description="News, FAQs, and campaign listings are being wired up. Use the header to explore the site structure."
      />
    </PublicShell>
  );
}

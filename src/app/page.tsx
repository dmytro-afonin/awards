"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@cvx/_generated/api";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const featuredCampaigns = useQuery(api.campaignPublic.listBrowse);
  const myCampaigns = useQuery(api.campaigns.listMine);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_40%)]">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-400">
                Awards Platform
              </p>
              <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Run campaigns that people can actually discover and vote in.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-zinc-300">
                Build Game Awards-style campaigns with categories, nominees, invite access, and a
                clean public voting experience.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {isLoaded && isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
                  >
                    Open dashboard
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
                  >
                    Sign in to manage campaigns
                  </Link>
                )}
                <Link
                  href="/#campaigns"
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/5"
                >
                  Browse live campaigns
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-zinc-400">Public campaigns</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {featuredCampaigns ? featuredCampaigns.length : "…"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-zinc-400">Open for voting</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {featuredCampaigns
                    ? featuredCampaigns.filter((campaign) => campaign.votableCategoryCount > 0)
                        .length
                    : "…"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-zinc-400">Your workspace</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {myCampaigns ? myCampaigns.length : "…"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-white">Your campaigns</h2>
              <p className="mt-1 text-zinc-400">
                Jump back into the campaigns you own or collaborate on.
              </p>
            </div>
            <Link
              href="/dashboard/campaigns/new"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-100 hover:bg-white/5"
            >
              New campaign
            </Link>
          </div>

          {myCampaigns === undefined ? (
            <p className="mt-6 text-zinc-500">Loading your workspace…</p>
          ) : myCampaigns.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-zinc-400">
              No campaigns yet. Create one from the dashboard to get started.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {myCampaigns.map((campaign) => (
                <div
                  key={campaign._id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                      <p className="mt-1 text-sm text-zinc-400">/{campaign.slug}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-zinc-300">
                      {campaign.visibility}
                    </span>
                  </div>
                  {campaign.description ? (
                    <p className="mt-3 line-clamp-2 text-sm text-zinc-400">
                      {campaign.description}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/dashboard/campaigns/${campaign._id}`}
                      className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
                    >
                      Manage
                    </Link>
                    <Link
                      href={`/c/${campaign.slug}`}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-100 hover:bg-white/5"
                    >
                      Public page
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="campaigns" className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-white">Open campaigns</h2>
              <p className="mt-1 text-zinc-400">
                Browse public campaigns and jump straight into the voting experience.
              </p>
            </div>
          </div>

          {featuredCampaigns === undefined ? (
            <p className="mt-6 text-zinc-500">Loading campaigns…</p>
          ) : featuredCampaigns.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-zinc-400">
              No public campaigns yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {featuredCampaigns.map((entry) => (
                <article
                  key={entry.campaign._id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                >
                  {entry.previewImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.previewImageUrl}
                      alt=""
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="h-44 bg-[linear-gradient(135deg,_rgba(245,158,11,0.18),_rgba(24,24,27,0.6))]" />
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {entry.campaign.name}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-400">/{entry.campaign.slug}</p>
                      </div>
                      {entry.votableCategoryCount > 0 ? (
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                          Voting open
                        </span>
                      ) : null}
                    </div>
                    {entry.campaign.description ? (
                      <p className="mt-3 line-clamp-3 text-sm text-zinc-400">
                        {entry.campaign.description}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400">
                      <span className="rounded-full border border-white/10 px-3 py-1">
                        {entry.totalCategoryCount} categories
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1">
                        {entry.nomineeCount} nominees
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1">
                        {entry.activeCategoryCount} active
                      </span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={`/c/${entry.campaign.slug}`}
                        className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
                      >
                        {entry.votableCategoryCount > 0 ? "Vote now" : "Open campaign"}
                      </Link>
                      {isLoaded && isSignedIn ? (
                        <Link
                          href="/dashboard"
                          className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-100 hover:bg-white/5"
                        >
                          Dashboard
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

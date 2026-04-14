"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { api } from "@cvx/_generated/api";
import { SiteHeader } from "@/components/site-header";

const statusLabels = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  finished: "Finished",
} as const;

function FieldPreview({ value }: { value: Record<string, unknown> }) {
  const t = value.type;
  if (t === "string" && typeof value.value === "string") {
    return <span>{value.value}</span>;
  }
  if (t === "date" && typeof value.iso === "string") {
    return <span>{new Date(value.iso).toLocaleString()}</span>;
  }
  if (t === "location" && typeof value.label === "string") {
    return <span>{value.label}</span>;
  }
  return null;
}

export default function PublicCampaignPage() {
  const params = useParams();
  const search = useSearchParams();
  const slug = params.slug as string;
  const inviteToken = search.get("invite") ?? undefined;
  const { isSignedIn } = useAuth();
  const data = useQuery(api.campaignPublic.getBySlug, { slug, inviteToken });
  const castVote = useMutation(api.votes.cast);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  if (data === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center text-zinc-500">Loading…</div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-xl font-semibold text-white">Campaign unavailable</h1>
          <p className="max-w-md text-zinc-500">
            This campaign is private or does not exist. Sign in and open an invite link, or use an
            invite token in the URL: <code className="text-amber-200">?invite=…</code>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/sign-in?redirect_url=${encodeURIComponent(
                inviteToken ? `/c/${slug}?invite=${inviteToken}` : `/c/${slug}`
              )}`}
              className="rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
            >
              Sign in
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/10 px-5 py-2 text-sm text-zinc-100 hover:bg-white/5"
            >
              Back to campaigns
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { campaign, categories } = data;
  const activeVotingCount = categories.filter(
    (category) => category.status === "active"
  ).length;
  const sectionLinks = categories.map((category) => ({
    id: `category-${category._id}`,
    title: category.title,
  }));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SiteHeader />

      <header className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_38%)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white">
            ← Back to campaigns
          </Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-amber-400">Public campaign</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {campaign.name}
              </h1>
              {campaign.description ? (
                <p className="mt-5 max-w-3xl text-lg text-zinc-300">{campaign.description}</p>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-zinc-400">Categories</p>
                <p className="mt-2 text-2xl font-semibold text-white">{categories.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-zinc-400">Open for voting</p>
                <p className="mt-2 text-2xl font-semibold text-white">{activeVotingCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-zinc-400">Access</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {inviteToken ? "Invite mode" : "Public"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="rounded-full border border-white/10 px-5 py-2 text-sm text-zinc-100 hover:bg-white/5"
              >
                Go to dashboard
              </Link>
            ) : (
              <Link
                href={`/sign-in?redirect_url=${encodeURIComponent(
                  inviteToken ? `/c/${slug}?invite=${inviteToken}` : `/c/${slug}`
                )}`}
                className="rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
              >
                Sign in to vote
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {sectionLinks.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {sectionLinks.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
              >
                {section.title}
              </a>
            ))}
          </div>
        ) : null}

        {voteMessage ? <p className="mb-4 text-sm text-emerald-300">{voteMessage}</p> : null}
        {voteError ? <p className="mb-4 text-sm text-red-400">{voteError}</p> : null}

        <div className="space-y-10">
          {categories.map((cat) => (
            <section
              key={cat._id}
              id={`category-${cat._id}`}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
            >
              <div className="grid gap-0 lg:grid-cols-[0.42fr_0.58fr]">
                <div className="border-b border-white/10 lg:border-b-0 lg:border-r">
                  {cat.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.imageUrl} alt="" className="h-full min-h-64 w-full object-cover" />
                  ) : (
                    <div className="h-full min-h-64 bg-[linear-gradient(135deg,_rgba(245,158,11,0.18),_rgba(24,24,27,0.6))]" />
                  )}
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        {statusLabels[cat.status]}
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold text-white">{cat.title}</h2>
                      {cat.description ? (
                        <p className="mt-3 max-w-2xl text-zinc-300">{cat.description}</p>
                      ) : null}
                    </div>
                    {cat.status === "active" ? (
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                        Voting open
                      </span>
                    ) : null}
                  </div>

                  {cat.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {cat.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {!isSignedIn && cat.status === "active" ? (
                    <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                      Sign in to cast a vote in this category.
                    </div>
                  ) : null}

                  <div className="mt-6 grid gap-4 xl:grid-cols-2">
                    {cat.nominees.map((n) => (
                      <article
                        key={n._id}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60"
                      >
                        {n.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={n.imageUrl}
                            alt=""
                            className="aspect-video w-full object-cover"
                          />
                        ) : (
                          <div className="aspect-video w-full bg-zinc-900" />
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-medium text-white">{n.title}</h3>
                            {n.isWinner && cat.showWinner ? (
                              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
                                Winner
                              </span>
                            ) : null}
                          </div>
                          <dl className="mt-4 space-y-2 text-sm text-zinc-400">
                            {cat.fieldDefinitions.map((def) => {
                              const val = n.fieldValues[def.key];
                              if (!val) return null;
                              return (
                                <div key={def.key} className="flex gap-2">
                                  <dt className="min-w-24 text-zinc-500">{def.label}</dt>
                                  <dd className="text-zinc-200">
                                    <FieldPreview value={val} />
                                  </dd>
                                </div>
                              );
                            })}
                          </dl>
                          {cat.status === "active" ? (
                            isSignedIn ? (
                              <button
                                type="button"
                                className="mt-5 w-full rounded-full bg-amber-500 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
                                onClick={async () => {
                                  setVoteError(null);
                                  setVoteMessage(null);
                                  try {
                                    await castVote({
                                      categoryId: cat._id,
                                      nomineeId: n._id,
                                      inviteToken,
                                    });
                                    setVoteMessage(`Vote recorded for "${n.title}" in ${cat.title}.`);
                                  } catch (error: unknown) {
                                    setVoteError(
                                      error instanceof Error ? error.message : "Could not record vote"
                                    );
                                  }
                                }}
                              >
                                Vote for {n.title}
                              </button>
                            ) : (
                              <Link
                                href={`/sign-in?redirect_url=${encodeURIComponent(
                                  inviteToken ? `/c/${slug}?invite=${inviteToken}` : `/c/${slug}`
                                )}`}
                                className="mt-5 block rounded-full border border-white/10 py-2.5 text-center text-sm font-medium text-zinc-100 hover:bg-white/5"
                              >
                                Sign in to vote
                              </Link>
                            )
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@cvx/_generated/api";

export default function DashboardPage() {
  const campaigns = useQuery(api.campaigns.listMine);

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-amber-400">Workspace</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Your campaigns</h1>
            <p className="mt-2 text-zinc-400">
              Manage campaign settings, category lifecycle, nominees, and access control.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-100 hover:bg-white/5"
            >
              Browse public campaigns
            </Link>
            <Link
              href="/dashboard/campaigns/new"
              className="rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
            >
              New campaign
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Campaign library</h2>
        <Link
          href="/dashboard/campaigns/new"
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          Create another
        </Link>
      </div>
      {campaigns === undefined ? (
        <p className="mt-8 text-zinc-500">Loading…</p>
      ) : campaigns.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-zinc-400">
          No campaigns yet. Create one to get started.
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 lg:grid-cols-2">
          {campaigns.map((c) => (
            <li key={c._id}>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{c.name}</h3>
                    <p className="mt-1 text-sm text-zinc-400">/{c.slug}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-zinc-300">
                    {c.visibility}
                  </span>
                </div>
                {c.description ? (
                  <p className="mt-3 line-clamp-2 text-sm text-zinc-400">{c.description}</p>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/campaigns/${c._id}`}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
                  >
                    Manage
                  </Link>
                  <Link
                    href={`/c/${c.slug}`}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-100 hover:bg-white/5"
                  >
                    Public page
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}

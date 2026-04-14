"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@cvx/_generated/api";
import Link from "next/link";

export default function NewCampaignPage() {
  const router = useRouter();
  const create = useMutation(api.campaigns.create);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setPending(true);
    try {
      const id = await create({
        name,
        slug: slug || name,
        visibility,
        description: description.trim() || undefined,
      });
      router.push(`/dashboard/campaigns/${id}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-white">
        ← Campaigns
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-white">New campaign</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm text-zinc-400">Name</label>
          <input
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400">URL slug</label>
          <input
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
            placeholder="auto from name if empty"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400">Visibility</label>
          <select
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as "public" | "private")}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-400">Description</label>
          <textarea
            className="mt-1 min-h-28 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional public description"
          />
        </div>
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create"}
        </button>
      </form>
    </div>
  );
}

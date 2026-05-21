import Link from "next/link";
import { PublicShell } from "@/components/public/public-shell";

export function CampaignNotFound() {
  return (
    <PublicShell>
      <div className="mx-auto flex max-w-md flex-col gap-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold text-white">
          Not found
        </h1>
        <p className="text-sm text-zinc-400">
          This campaign does not exist, is not available yet, or you do not have
          access to view it.
        </p>
        <Link
          href="/"
          className="inline-flex justify-center border border-zinc-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-200 no-underline hover:border-amber-500/50 hover:text-amber-300"
        >
          Back home
        </Link>
      </div>
    </PublicShell>
  );
}

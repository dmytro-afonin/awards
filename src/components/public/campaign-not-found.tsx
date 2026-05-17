import Link from "next/link";
import { PublicShell } from "@/components/public/public-shell";
import { buttonVariants } from "@/components/ui/button";

export function CampaignNotFound() {
  return (
    <PublicShell>
      <div className="mx-auto flex max-w-md flex-col gap-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold">Not found</h1>
        <p className="text-sm text-muted-foreground">
          This campaign does not exist, is not available yet, or you do not have
          access to view it.
        </p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back home
        </Link>
      </div>
    </PublicShell>
  );
}

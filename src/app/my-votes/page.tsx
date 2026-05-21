import { PublicShell } from "@/components/public/public-shell";
import { PublicSitePage } from "@/components/public/public-site-page";

export default function MyVotesPage() {
  return (
    <PublicShell>
      <PublicSitePage
        title="My votes"
        description="A signed-in overview of categories you have voted in across campaigns will appear here."
      />
    </PublicShell>
  );
}

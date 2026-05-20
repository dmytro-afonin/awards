import { PublicShell } from "@/components/public/public-shell";
import { PublicSitePage } from "@/components/public/public-site-page";

export default function CampaignsPage() {
  return (
    <PublicShell>
      <PublicSitePage
        title="Campaigns"
        description="Browse every public awards campaign you can view and vote in. A directory of live and upcoming programs will appear here."
      />
    </PublicShell>
  );
}

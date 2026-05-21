import { PublicCampaignsDirectory } from "@/components/public/public-campaigns-directory";
import { PublicShell } from "@/components/public/public-shell";
import { PublicSitePage } from "@/components/public/public-site-page";

export default function CampaignsPage() {
  return (
    <PublicShell>
      <PublicSitePage
        title="Campaigns"
        description="Browse public awards campaigns and the private programs you have access to. Each card shows whether a campaign is public or private."
      >
        <PublicCampaignsDirectory />
      </PublicSitePage>
    </PublicShell>
  );
}

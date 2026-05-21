import { PublicShell } from "@/components/public/public-shell";
import { PublicSitePage } from "@/components/public/public-site-page";

export default function AboutPage() {
  return (
    <PublicShell>
      <PublicSitePage
        title="About"
        description="Learn who runs Awards, how organizations host campaigns, and how the public voting experience is designed."
      />
    </PublicShell>
  );
}

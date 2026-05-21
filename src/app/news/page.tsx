import { PublicShell } from "@/components/public/public-shell";
import { PublicSitePage } from "@/components/public/public-site-page";

export default function NewsPage() {
  return (
    <PublicShell>
      <PublicSitePage
        title="News"
        description="Platform-wide announcements, winner reveals, and event coverage will be published here."
      />
    </PublicShell>
  );
}

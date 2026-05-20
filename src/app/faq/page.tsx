import { PublicShell } from "@/components/public/public-shell";
import { PublicSitePage } from "@/components/public/public-site-page";

export default function FaqPage() {
  return (
    <PublicShell>
      <PublicSitePage
        title="FAQ"
        description="Answers about voting, accounts, and how campaigns work will live on this page."
      />
    </PublicShell>
  );
}

type PublicCampaignPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicCampaignPage({
  params,
}: PublicCampaignPageProps) {
  const { slug } = await params;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-2xl font-semibold">Campaign preview</h1>
      <p className="text-muted-foreground">
        Public campaign page for <code className="font-mono">{slug}</code> is
        not built yet.
      </p>
    </main>
  );
}

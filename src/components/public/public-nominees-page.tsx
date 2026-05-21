"use client";

import { StoryNomineesPage } from "@/components/public/layouts/story";

export function PublicNomineesPage({ slug }: { slug: string }) {
  return <StoryNomineesPage slug={slug} />;
}

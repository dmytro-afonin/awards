"use client";

import { StoryCategoryPage } from "@/components/public/layouts/story";

export function PublicCategoryPage({
  slug,
  categorySlug,
}: {
  slug: string;
  categorySlug: string;
}) {
  return <StoryCategoryPage slug={slug} categorySlug={categorySlug} />;
}

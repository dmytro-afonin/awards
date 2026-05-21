"use client";

import { StoryCategoriesPage } from "@/components/public/layouts/story";

export function PublicCategoriesPage({ slug }: { slug: string }) {
  return <StoryCategoriesPage slug={slug} />;
}

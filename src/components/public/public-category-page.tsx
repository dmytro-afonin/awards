"use client";

import type { Id } from "@cvx/_generated/dataModel";
import {
  getLayoutPages,
  PublicLayoutChrome,
} from "@/components/public/layouts/registry";
import { usePublicLayout } from "@/components/public/layouts/use-public-layout";

export function PublicCategoryPage({
  slug,
  categoryId,
}: {
  slug: string;
  categoryId: Id<"campaignCategories">;
}) {
  const layout = usePublicLayout();
  const { Category } = getLayoutPages(layout);

  return (
    <>
      <Category slug={slug} categoryId={categoryId} />
      <PublicLayoutChrome />
    </>
  );
}

"use client";

import {
  getLayoutPages,
  PublicLayoutChrome,
} from "@/components/public/layouts/registry";
import { usePublicLayout } from "@/components/public/layouts/use-public-layout";

export function PublicCategoriesPage({ slug }: { slug: string }) {
  const layout = usePublicLayout();
  const { Categories } = getLayoutPages(layout);

  return (
    <>
      <Categories slug={slug} />
      <PublicLayoutChrome />
    </>
  );
}

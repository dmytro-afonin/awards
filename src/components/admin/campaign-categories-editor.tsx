"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { RiAddLine, RiDeleteBinLine } from "@remixicon/react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type CampaignCategoriesEditorProps = {
  campaignId: Id<"campaigns">;
  disabled?: boolean;
};

export function CampaignCategoriesEditor({
  campaignId,
  disabled,
}: CampaignCategoriesEditorProps) {
  const categories = useQuery(api.campaignCategories.listForCampaign, {
    campaignId,
  });
  const readiness = useQuery(api.campaignCategories.readinessSummary, {
    campaignId,
  });

  const createCategory = useMutation(api.campaignCategories.createCategory);
  const removeCategory = useMutation(api.campaignCategories.removeCategory);
  const addNominee = useMutation(api.campaignCategories.addNominee);
  const removeNominee = useMutation(api.campaignCategories.removeNominee);
  const setCategoryImage = useMutation(api.campaignCategories.setCategoryImage);
  const clearCategoryImage = useMutation(
    api.campaignCategories.clearCategoryImage,
  );
  const setNomineeImage = useMutation(api.campaignCategories.setNomineeImage);
  const clearNomineeImage = useMutation(
    api.campaignCategories.clearNomineeImage,
  );

  const [newCategoryName, setNewCategoryName] = useState("");
  const [nomineeNames, setNomineeNames] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] =
    useState<Id<"campaignCategories"> | null>(null);

  if (categories === undefined) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name || disabled) return;
    setBusy(true);
    try {
      await createCategory({ campaignId, name });
      setNewCategoryName("");
    } finally {
      setBusy(false);
    }
  };

  const handleAddNominee = async (categoryId: Id<"campaignCategories">) => {
    const name = nomineeNames[categoryId]?.trim();
    if (!name || disabled) return;
    setBusy(true);
    try {
      await addNominee({ categoryId, name });
      setNomineeNames((prev) => ({ ...prev, [categoryId]: "" }));
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveCategory = async (categoryId: Id<"campaignCategories">) => {
    if (disabled || busy || deletingCategoryId) return;
    setDeletingCategoryId(categoryId);
    try {
      await removeCategory({ categoryId });
    } catch {
      // Mutation errors surface via Convex; keep UI responsive.
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const needsMoreNominees =
    readiness && !readiness.canLaunch && readiness.categoryCount > 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="sticky top-0 z-10 -mx-1 flex flex-col gap-3 border-b border-border bg-background/95 px-1 py-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="max-w-md"
              disabled={disabled || busy}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAddCategory();
                }
              }}
            />
            <Button
              type="button"
              className="shrink-0 gap-1.5"
              disabled={disabled || busy || !newCategoryName.trim()}
              onClick={() => void handleAddCategory()}
            >
              <RiAddLine className="size-4" />
              Add category
            </Button>
          </div>
          {readiness ? (
            <Badge
              variant={readiness.canLaunch ? "secondary" : "outline"}
              className={cn(
                "shrink-0",
                !readiness.canLaunch &&
                  "border-amber-500/40 text-amber-800 dark:text-amber-200",
              )}
            >
              {readiness.categoryCount} categor
              {readiness.categoryCount === 1 ? "y" : "ies"}
              {readiness.canLaunch ? " · ready to launch" : " · needs work"}
            </Badge>
          ) : null}
        </div>
        {readiness && !readiness.canLaunch ? (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {readiness.categoryCount === 0
              ? "Add a category, then at least two nominees in each."
              : "Each category needs at least two nominees before launch."}
          </p>
        ) : null}
      </div>

      {categories.length === 0 ? (
        <Empty className="border border-dashed border-border py-16">
          <EmptyHeader>
            <EmptyTitle>No categories yet</EmptyTitle>
            <EmptyDescription>
              Add your first category above, then add at least two nominees per
              category.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-10">
          {categories.map((category, index) => {
            const nomineeCount = category.nominees.length;
            const categoryReady = nomineeCount >= 2;

            return (
              <section
                key={category._id}
                className={cn(
                  "flex flex-col gap-4",
                  index > 0 && "border-t border-border pt-10",
                )}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <ImageUploadField
                    variant="compact"
                    label="Category photo"
                    imageUrl={category.imageUrl}
                    aspect={1}
                    previewClassName="w-24 shrink-0 sm:w-28"
                    disabled={disabled || busy}
                    processingTarget={{
                      type: "category",
                      categoryId: category._id,
                    }}
                    onUpload={async (storageId) => {
                      await setCategoryImage({
                        categoryId: category._id,
                        storageId,
                      });
                    }}
                    onRemove={async () => {
                      await clearCategoryImage({ categoryId: category._id });
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h2 className="text-lg font-medium tracking-tight">
                        {category.name}
                      </h2>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-normal",
                          !categoryReady &&
                            needsMoreNominees &&
                            "border-amber-500/40 text-amber-800 dark:text-amber-200",
                        )}
                      >
                        {nomineeCount} nominee{nomineeCount === 1 ? "" : "s"}
                        {!categoryReady ? " · need 2+" : ""}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="ml-auto size-8 text-muted-foreground hover:text-destructive"
                        disabled={
                          disabled ||
                          busy ||
                          deletingCategoryId === category._id
                        }
                        aria-label={`Remove ${category.name}`}
                        onClick={() => void handleRemoveCategory(category._id)}
                      >
                        <RiDeleteBinLine className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {category.nominees.map((nominee) => (
                    <li key={nominee._id}>
                      <article className="overflow-hidden rounded-lg border border-border bg-card">
                        <ImageUploadField
                          variant="compact"
                          label={`${nominee.name} photo`}
                          imageUrl={nominee.imageUrl}
                          aspect={1}
                          previewClassName="w-full !rounded-none border-0 border-b border-border"
                          disabled={disabled || busy}
                          processingTarget={{
                            type: "nominee",
                            nomineeId: nominee._id,
                          }}
                          onUpload={async (storageId) => {
                            await setNomineeImage({
                              nomineeId: nominee._id,
                              storageId,
                            });
                          }}
                          onRemove={async () => {
                            await clearNomineeImage({
                              nomineeId: nominee._id,
                            });
                          }}
                        />
                        <div className="flex items-center gap-1 border-t border-border px-2 py-1.5">
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {nominee.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            disabled={disabled || busy}
                            aria-label={`Remove ${nominee.name}`}
                            onClick={() =>
                              removeNominee({ nomineeId: nominee._id })
                            }
                          >
                            <RiDeleteBinLine className="size-3.5" />
                          </Button>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>

                <div className="flex max-w-sm gap-2">
                  <Input
                    value={nomineeNames[category._id] ?? ""}
                    onChange={(e) =>
                      setNomineeNames((prev) => ({
                        ...prev,
                        [category._id]: e.target.value,
                      }))
                    }
                    placeholder="Nominee name"
                    disabled={disabled || busy}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleAddNominee(category._id);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 gap-1"
                    disabled={disabled || busy}
                    onClick={() => void handleAddNominee(category._id)}
                  >
                    <RiAddLine className="size-4" />
                    Add
                  </Button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

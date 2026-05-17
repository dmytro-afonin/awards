"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { RiAddLine, RiDeleteBinLine } from "@remixicon/react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
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

  if (categories === undefined) {
    return <Skeleton className="h-24 w-full" />;
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

  return (
    <Field>
      <FieldLabel>Categories & nominees</FieldLabel>
      <FieldContent className="gap-4">
        <FieldDescription>
          Mark as ready requires at least one category, each with at least two
          nominees.
        </FieldDescription>

        {readiness && !readiness.canMarkReady ? (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {readiness.categoryCount === 0
              ? "Add a category and at least two nominees per category."
              : "Some categories need more nominees (minimum 2 each)."}
          </p>
        ) : null}

        <ul className="flex flex-col gap-3">
          {categories.map((category) => (
            <li
              key={category._id}
              className="border border-border bg-muted/30 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-medium">{category.name}</span>
                <span
                  className={cn(
                    "text-xs",
                    category.nominees.length >= 2
                      ? "text-muted-foreground"
                      : "text-amber-700 dark:text-amber-300",
                  )}
                >
                  {category.nominees.length} nominee
                  {category.nominees.length === 1 ? "" : "s"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={disabled || busy}
                  aria-label={`Remove ${category.name}`}
                  onClick={() => removeCategory({ categoryId: category._id })}
                >
                  <RiDeleteBinLine className="size-4" />
                </Button>
              </div>
              <ImageUploadField
                label="Category photo"
                imageUrl={category.imageUrl}
                aspect={1}
                previewClassName="max-w-40"
                disabled={disabled || busy}
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
              <ul className="mb-2 flex flex-col gap-3">
                {category.nominees.map((nominee) => (
                  <li
                    key={nominee._id}
                    className="border-t border-border/60 pt-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium">{nominee.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        disabled={disabled || busy}
                        aria-label={`Remove ${nominee.name}`}
                        onClick={() =>
                          removeNominee({ nomineeId: nominee._id })
                        }
                      >
                        <RiDeleteBinLine className="size-3.5" />
                      </Button>
                    </div>
                    <ImageUploadField
                      label="Nominee photo"
                      imageUrl={nominee.imageUrl}
                      aspect={1}
                      previewClassName="max-w-32"
                      disabled={disabled || busy}
                      onUpload={async (storageId) => {
                        await setNomineeImage({
                          nomineeId: nominee._id,
                          storageId,
                        });
                      }}
                      onRemove={async () => {
                        await clearNomineeImage({ nomineeId: nominee._id });
                      }}
                    />
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
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
                  size="sm"
                  disabled={disabled || busy}
                  onClick={() => handleAddNominee(category._id)}
                >
                  Add
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
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
            variant="outline"
            size="sm"
            className="shrink-0 gap-1"
            disabled={disabled || busy || !newCategoryName.trim()}
            onClick={handleAddCategory}
          >
            <RiAddLine className="size-4" />
            Category
          </Button>
        </div>
      </FieldContent>
    </Field>
  );
}

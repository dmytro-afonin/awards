"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@cvx/_generated/api";
import type { Doc, Id } from "@cvx/_generated/dataModel";

type CampaignDoc = Doc<"campaigns">;
type CategoryDoc = Doc<"categories">;
type NomineeDoc = Doc<"nominees">;
type FieldDefinitionDoc = Doc<"fieldDefinitions">;
type FieldType = FieldDefinitionDoc["type"];
type FieldValue = NomineeDoc["fieldValues"][string];
type MemberRole = Doc<"campaignMembers">["role"];
type FieldDraft = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
};

const statusLabels: Record<CategoryDoc["status"], string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  finished: "Finished",
};

const fieldTypeOptions: FieldType[] = ["string", "location", "date"];

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function tagsToText(tags: string[]) {
  return tags.join(", ");
}

function toFieldDrafts(definitions?: FieldDefinitionDoc[] | null): FieldDraft[] {
  return (definitions ?? []).map((definition, index) => ({
    key: definition.key,
    label: definition.label,
    type: definition.type,
    required: definition.required,
    order: definition.order ?? index,
  }));
}

function serializeFieldDrafts(fields: FieldDraft[]) {
  return fields
    .map((field, index) => ({
      key: field.key.trim(),
      label: field.label.trim(),
      type: field.type,
      required: field.required,
      order: index,
    }))
    .filter((field) => field.key.length > 0 && field.label.length > 0);
}

function mergeFieldDefinitions(
  campaignFields: FieldDefinitionDoc[],
  categoryFields: FieldDefinitionDoc[]
) {
  const merged = new Map<string, FieldDefinitionDoc>();
  for (const field of campaignFields) {
    merged.set(field.key, field);
  }
  for (const field of categoryFields) {
    merged.set(field.key, field);
  }
  return [...merged.values()].sort((a, b) => a.order - b.order);
}

function buildFieldValuesPayload(
  definitions: FieldDefinitionDoc[],
  values: Record<string, FieldValue>
) {
  const payload: Record<string, FieldValue> = {};
  for (const definition of definitions) {
    const value = values[definition.key];
    if (!value) continue;
    if (value.type === "string") {
      const next = value.value.trim();
      if (next) payload[definition.key] = { type: "string", value: next };
      continue;
    }
    if (value.type === "location") {
      const next = value.label.trim();
      if (next) payload[definition.key] = { type: "location", label: next };
      continue;
    }
    if (value.type === "date" && value.iso) {
      payload[definition.key] = value;
    }
  }
  return payload;
}

async function uploadImage(
  file: File,
  campaignId: Id<"campaigns">,
  generateUploadUrl: ReturnType<typeof useMutation<typeof api.files.generateUploadUrl>>
): Promise<Id<"_storage">> {
  const uploadUrl = await generateUploadUrl({ campaignId });
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!response.ok) {
    throw new Error("Failed to upload image");
  }
  const body = (await response.json()) as { storageId?: Id<"_storage"> };
  if (!body.storageId) {
    throw new Error("Upload did not return a storage ID");
  }
  return body.storageId;
}

function FieldDefinitionsEditor({
  title,
  fields,
  description,
  onChange,
  onSave,
  saveLabel = "Save fields",
}: {
  title: string;
  fields: FieldDraft[];
  description: string;
  onChange: (fields: FieldDraft[]) => void;
  onSave: () => Promise<unknown>;
  saveLabel?: string;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-white">{title}</h3>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
        <button
          type="button"
          className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-white hover:bg-zinc-700"
          onClick={() =>
            {
              setSuccess(null);
              onChange([
                ...fields,
                {
                  key: `field_${fields.length + 1}`,
                  label: `Field ${fields.length + 1}`,
                  type: "string",
                  required: false,
                  order: fields.length,
                },
              ]);
            }
          }
        >
          Add field
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {fields.length === 0 ? (
          <p className="text-sm text-zinc-500">No fields yet.</p>
        ) : (
          fields.map((field, index) => (
            <div
              key={`${field.key}-${index}`}
              className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 md:grid-cols-[1fr_1fr_140px_auto_auto]"
            >
              <input
                className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
                placeholder="field_key"
                value={field.key}
                onChange={(event) =>
                  onChange(
                    fields.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, key: event.target.value } : row
                    )
                  )
                }
                onFocus={() => setSuccess(null)}
              />
              <input
                className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
                placeholder="Public label"
                value={field.label}
                onChange={(event) =>
                  onChange(
                    fields.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, label: event.target.value } : row
                    )
                  )
                }
              />
              <select
                className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
                value={field.type}
                onChange={(event) =>
                  onChange(
                    fields.map((row, rowIndex) =>
                      rowIndex === index
                        ? { ...row, type: event.target.value as FieldType }
                        : row
                    )
                  )
                }
                onFocus={() => setSuccess(null)}
              >
                {fieldTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(event) =>
                    onChange(
                      fields.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, required: event.target.checked }
                          : row
                      )
                    )
                  }
                  onFocus={() => setSuccess(null)}
                />
                Required
              </label>
              <button
                type="button"
                className="rounded-md border border-red-900/50 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40"
                onClick={() => {
                  setSuccess(null);
                  onChange(fields.filter((_, rowIndex) => rowIndex !== index));
                }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-emerald-300">{success}</p> : null}

      <div className="mt-4">
        <button
          type="button"
          disabled={saving}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60"
          onClick={async () => {
            setSaving(true);
            setError(null);
            try {
              await onSave();
              setSuccess("Saved field schema.");
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "Failed to save fields");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Saving…" : saveLabel}
        </button>
      </div>
    </div>
  );
}

function DynamicFieldInput({
  definition,
  value,
  onChange,
}: {
  definition: FieldDefinitionDoc;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
}) {
  if (definition.type === "string") {
    const current = value?.type === "string" ? value.value : "";
    return (
      <input
        className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
        value={current}
        onChange={(event) =>
          onChange({ type: "string", value: event.target.value })
        }
        placeholder={definition.label}
      />
    );
  }

  if (definition.type === "location") {
    const current = value?.type === "location" ? value.label : "";
    return (
      <input
        className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
        value={current}
        onChange={(event) =>
          onChange({ type: "location", label: event.target.value })
        }
        placeholder="Location"
      />
    );
  }

  const current = value?.type === "date" ? value.iso.slice(0, 10) : "";
  return (
    <input
      type="date"
      className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
      value={current}
      onChange={(event) =>
        onChange({ type: "date", iso: event.target.value })
      }
    />
  );
}

function NomineeEditor({
  campaignId,
  categoryId,
  fieldDefinitions,
  nominee,
}: {
  campaignId: Id<"campaigns">;
  categoryId: Id<"categories">;
  fieldDefinitions: FieldDefinitionDoc[];
  nominee?: NomineeDoc;
}) {
  const createNominee = useMutation(api.nominees.create);
  const updateNominee = useMutation(api.nominees.update);
  const removeNominee = useMutation(api.nominees.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>({});
  const [isWinner, setIsWinner] = useState(false);
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const imageUrl = useQuery(api.files.getUrl, { campaignId, storageId: imageStorageId });

  useEffect(() => {
    if (!nominee) {
      setTitle("");
      setTags("");
      setFieldValues({});
      setIsWinner(false);
      setImageStorageId(null);
      return;
    }
    setTitle(nominee.title);
    setTags(tagsToText(nominee.tags));
    setFieldValues(nominee.fieldValues);
    setIsWinner(!!nominee.isWinner);
    setImageStorageId(nominee.imageStorageId ?? null);
    setSuccess(null);
    setError(null);
  }, [nominee, fieldDefinitions]);

  async function saveNominee() {
    const payloadFieldValues = buildFieldValuesPayload(fieldDefinitions, fieldValues);
    if (!title.trim()) throw new Error("Nominee title is required");
    if (nominee) {
      await updateNominee({
        id: nominee._id,
        title: title.trim(),
        tags: parseTags(tags),
        fieldValues: payloadFieldValues,
        imageStorageId,
        isWinner,
      });
      setSuccess(`Saved nominee "${title.trim()}".`);
      return;
    }
    await createNominee({
      categoryId,
      title: title.trim(),
      tags: parseTags(tags),
      fieldValues: payloadFieldValues,
      ...(imageStorageId ? { imageStorageId } : {}),
    });
    setTitle("");
    setTags("");
    setFieldValues({});
    setIsWinner(false);
    setImageStorageId(null);
    setSuccess(`Added nominee "${title.trim()}".`);
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="mb-4 h-40 w-full rounded-xl object-cover"
        />
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm text-zinc-400">Title</label>
          <input
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onFocus={() => setSuccess(null)}
            placeholder="Nominee title"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-400">Tags</label>
          <input
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            onFocus={() => setSuccess(null)}
            placeholder="movie, sci-fi, popular"
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {fieldDefinitions.map((definition) => (
          <div key={definition.key}>
            <label className="text-sm text-zinc-400">
              {definition.label}
              {definition.required ? " *" : ""}
            </label>
            <DynamicFieldInput
              definition={definition}
              value={fieldValues[definition.key]}
              onChange={(value) =>
                {
                  setSuccess(null);
                  setFieldValues((current) => ({
                    ...current,
                    [definition.key]: value,
                  }));
                }
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="text-sm text-zinc-400">
          <span className="mr-2">Image</span>
          <input
            type="file"
            accept="image/*"
            className="text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-white"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setError(null);
              try {
                const storageId = await uploadImage(file, campaignId, generateUploadUrl);
                setImageStorageId(storageId);
                setSuccess("Image uploaded. Save to apply it.");
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to upload image");
              } finally {
                setUploading(false);
                event.target.value = "";
              }
            }}
          />
        </label>
        <span className="text-xs text-zinc-500">
          {imageStorageId ? "Image ready" : "No image uploaded"}
        </span>
        {nominee ? (
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={isWinner}
              onChange={(event) => setIsWinner(event.target.checked)}
            />
            Winner
          </label>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-emerald-300">{success}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving || uploading}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60"
          onClick={async () => {
            setSaving(true);
            setError(null);
            try {
              await saveNominee();
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "Failed to save nominee");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Saving…" : nominee ? "Save nominee" : "Add nominee"}
        </button>
        {nominee ? (
          <>
            <button
              type="button"
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
              onClick={() => {
                setImageStorageId(null);
                setSuccess("Image removed. Save to apply it.");
              }}
            >
              Remove image
            </button>
            <button
              type="button"
              className="rounded-md border border-red-900/50 px-4 py-2 text-sm text-red-300 hover:bg-red-950/40"
              onClick={async () => {
                if (!window.confirm(`Delete nominee "${nominee.title}"?`)) return;
                await removeNominee({ id: nominee._id });
              }}
            >
              Delete nominee
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function CategoryCard({
  campaignId,
  category,
}: {
  campaignId: Id<"campaigns">;
  category: CategoryDoc;
}) {
  const fieldEditorData = useQuery(api.fields.listForCategoryEditor, {
    categoryId: category._id,
  });
  const nominees = useQuery(api.nominees.listByCategory, { categoryId: category._id });

  const updateCategoryMeta = useMutation(api.categories.updateMeta);
  const setStatus = useMutation(api.categories.setStatus);
  const removeCategory = useMutation(api.categories.remove);
  const setCategoryFields = useMutation(api.fields.setCategoryFields);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [title, setTitle] = useState(category.title);
  const [description, setDescription] = useState(category.description ?? "");
  const [tags, setTags] = useState(tagsToText(category.tags));
  const [order, setOrder] = useState(String(category.order));
  const [canVote, setCanVote] = useState(!!category.canVote);
  const [showWinner, setShowWinner] = useState(!!category.showWinner);
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
    category.imageStorageId ?? null
  );
  const [fieldDrafts, setFieldDrafts] = useState<FieldDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const imageUrl = useQuery(api.files.getUrl, { campaignId, storageId: imageStorageId });

  useEffect(() => {
    setTitle(category.title);
    setDescription(category.description ?? "");
    setTags(tagsToText(category.tags));
    setOrder(String(category.order));
    setCanVote(!!category.canVote);
    setShowWinner(!!category.showWinner);
    setImageStorageId(category.imageStorageId ?? null);
    setSuccess(null);
    setError(null);
  }, [category]);

  useEffect(() => {
    setFieldDrafts(toFieldDrafts(fieldEditorData?.category));
  }, [fieldEditorData]);

  const mergedFieldDefinitions = useMemo(
    () =>
      mergeFieldDefinitions(
        fieldEditorData?.campaign ?? [],
        fieldEditorData?.category ?? []
      ),
    [fieldEditorData]
  );
  const sortedNominees = useMemo(
    () => (nominees ? [...nominees].sort((a, b) => a.order - b.order) : []),
    [nominees]
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-medium text-white">{category.title}</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {statusLabels[category.status]} · order {category.order}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {category.status === "draft" ? (
            <button
              type="button"
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white"
              onClick={() => void setStatus({ id: category._id, status: "active" })}
            >
              Start
            </button>
          ) : null}
          {category.status === "active" ? (
            <>
              <button
                type="button"
                className="rounded-md bg-amber-600 px-3 py-2 text-sm text-white"
                onClick={() => void setStatus({ id: category._id, status: "paused" })}
              >
                Pause
              </button>
              <button
                type="button"
                className="rounded-md bg-zinc-700 px-3 py-2 text-sm text-white"
                onClick={() => void setStatus({ id: category._id, status: "finished" })}
              >
                Finish
              </button>
            </>
          ) : null}
          {category.status === "paused" ? (
            <>
              <button
                type="button"
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white"
                onClick={() => void setStatus({ id: category._id, status: "active" })}
              >
                Resume
              </button>
              <button
                type="button"
                className="rounded-md bg-zinc-700 px-3 py-2 text-sm text-white"
                onClick={() => void setStatus({ id: category._id, status: "finished" })}
              >
                Finish
              </button>
            </>
          ) : null}
        </div>
      </div>

      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="mt-5 h-52 w-full rounded-2xl object-cover"
        />
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm text-zinc-400">Title</label>
          <input
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onFocus={() => setSuccess(null)}
          />
        </div>
        <div>
          <label className="text-sm text-zinc-400">Tags</label>
          <input
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            onFocus={() => setSuccess(null)}
            placeholder="featured, popular"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-zinc-400">Description</label>
          <textarea
            className="mt-1 min-h-24 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onFocus={() => setSuccess(null)}
          />
        </div>
        <div>
          <label className="text-sm text-zinc-400">Order</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
            value={order}
            onChange={(event) => setOrder(event.target.value)}
            onFocus={() => setSuccess(null)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={canVote}
              onChange={(event) => setCanVote(event.target.checked)}
            />
            Allow voting
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={showWinner}
              onChange={(event) => setShowWinner(event.target.checked)}
            />
            Show winner
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-zinc-400">
          <span className="mr-2">Category image</span>
          <input
            type="file"
            accept="image/*"
            className="text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-white"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setError(null);
              try {
                const storageId = await uploadImage(file, campaignId, generateUploadUrl);
                setImageStorageId(storageId);
                setSuccess("Image uploaded. Save category to apply it.");
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to upload image");
              } finally {
                setUploading(false);
                event.target.value = "";
              }
            }}
          />
        </label>
        <span className="text-xs text-zinc-500">
          {imageStorageId ? "Image ready" : "No image uploaded"}
        </span>
      </div>

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-emerald-300">{success}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving || uploading}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60"
          onClick={async () => {
            setSaving(true);
            setError(null);
            try {
              await updateCategoryMeta({
                id: category._id,
                title: title.trim(),
                description: description.trim() || undefined,
                tags: parseTags(tags),
                order: Number(order),
                imageStorageId,
                canVote,
                showWinner,
              });
              setSuccess(`Saved category "${title.trim()}".`);
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "Failed to save category");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Saving…" : "Save category"}
        </button>
        <button
          type="button"
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          onClick={() => {
            setImageStorageId(null);
            setSuccess("Image removed. Save category to apply it.");
          }}
        >
          Remove image
        </button>
        <button
          type="button"
          className="rounded-md border border-red-900/50 px-4 py-2 text-sm text-red-300 hover:bg-red-950/40"
          onClick={async () => {
            if (!window.confirm(`Delete category "${category.title}"?`)) return;
            await removeCategory({ id: category._id });
          }}
        >
          Delete category
        </button>
      </div>

      <div className="mt-6">
        <FieldDefinitionsEditor
          title="Category fields"
          description="These override or extend the campaign-wide field schema for this category."
          fields={fieldDrafts}
          onChange={setFieldDrafts}
          onSave={async () =>
            setCategoryFields({
              categoryId: category._id,
              fields: serializeFieldDrafts(fieldDrafts),
            })
          }
        />
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <h4 className="text-base font-medium text-white">Nominees</h4>
        <p className="mt-1 text-sm text-zinc-500">
          Add nominees and populate the dynamic fields configured for this category.
        </p>

        <div className="mt-4 space-y-4">
          {sortedNominees.map((nominee) => (
            <NomineeEditor
              key={nominee._id}
              campaignId={campaignId}
              categoryId={category._id}
              fieldDefinitions={mergedFieldDefinitions}
              nominee={nominee}
            />
          ))}
        </div>

        <div className="mt-5 border-t border-zinc-800 pt-5">
          <h5 className="text-sm font-medium text-zinc-300">Add nominee</h5>
          <div className="mt-3">
            <NomineeEditor
              campaignId={campaignId}
              categoryId={category._id}
              fieldDefinitions={mergedFieldDefinitions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as Id<"campaigns">;

  const viewer = useQuery(api.users.viewer);
  const campaign = useQuery(api.campaigns.get, { id: campaignId });
  const categories = useQuery(
    api.categories.listByCampaign,
    campaign ? { campaignId } : "skip"
  );
  const campaignFields = useQuery(
    api.fields.listForCampaignEditor,
    campaign ? { campaignId } : "skip"
  );
  const invites = useQuery(
    api.invites.listInvites,
    campaign && campaign.visibility === "private" ? { campaignId } : "skip"
  );
  const allowlist = useQuery(
    api.invites.listAllowlist,
    campaign && campaign.visibility === "private" ? { campaignId } : "skip"
  );
  const members = useQuery(api.invites.listMembers, campaign ? { campaignId } : "skip");

  const updateCampaign = useMutation(api.campaigns.update);
  const removeCampaign = useMutation(api.campaigns.remove);
  const createCategory = useMutation(api.categories.create);
  const generateInvite = useMutation(api.invites.generateInvite);
  const revokeInvite = useMutation(api.invites.revokeInvite);
  const addEmail = useMutation(api.invites.addAllowlistEmail);
  const removeAllowlistEmail = useMutation(api.invites.removeAllowlistEmail);
  const setMemberRole = useMutation(api.invites.setMemberRole);
  const removeMember = useMutation(api.invites.removeMember);
  const setCampaignFields = useMutation(api.fields.setCampaignFields);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CampaignDoc["visibility"]>("public");
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryTags, setNewCategoryTags] = useState("");
  const [inviteSecret, setInviteSecret] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [campaignFieldDrafts, setCampaignFieldDrafts] = useState<FieldDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [campaignSuccess, setCampaignSuccess] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<"categories"> | null>(null);

  useEffect(() => {
    if (!campaign) return;
    setName(campaign.name);
    setSlug(campaign.slug);
    setDescription(campaign.description ?? "");
    setVisibility(campaign.visibility);
  }, [campaign]);

  useEffect(() => {
    setCampaignFieldDrafts(toFieldDrafts(campaignFields));
  }, [campaignFields]);

  const sortedCategories = useMemo(
    () => (categories ? [...categories].sort((a, b) => a.order - b.order) : []),
    [categories]
  );
  const selectedCategory =
    sortedCategories.find((category) => category._id === selectedCategoryId) ??
    sortedCategories[0] ??
    null;

  useEffect(() => {
    if (sortedCategories.length === 0) {
      setSelectedCategoryId(null);
      return;
    }
    if (!selectedCategoryId || !sortedCategories.some((category) => category._id === selectedCategoryId)) {
      setSelectedCategoryId(sortedCategories[0]._id);
    }
  }, [selectedCategoryId, sortedCategories]);

  const isOwner = !!viewer && !!campaign && viewer._id === campaign.ownerId;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = campaign ? `${origin}/c/${campaign.slug}` : "";

  if (campaign === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-zinc-500">Loading…</div>
    );
  }

  if (campaign === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-zinc-400">Campaign not found or no access.</p>
        <Link href="/dashboard" className="text-amber-500 hover:underline">
          Back
        </Link>
      </div>
    );
  }

  if (categories === undefined || members === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-zinc-500">Loading…</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white">
          ← Back to workspace
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-400">Campaign editor</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">{campaign.name}</h1>
            <p className="mt-2 text-sm text-zinc-400">
              <span className="uppercase">{campaign.visibility}</span> · {publicUrl}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
            >
              View public page
            </a>
            {selectedCategory ? (
              <a
                href={`#category-${selectedCategory._id}`}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
              >
                Jump to category
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-medium text-white">Campaign settings</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm text-zinc-400">Name</label>
              <input
                className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Slug</label>
              <input
                className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-zinc-400">Description</label>
              <textarea
                className="mt-1 min-h-28 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Visibility</label>
              <select
                className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as CampaignDoc["visibility"])
                }
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
          {campaignSuccess ? <p className="mt-3 text-sm text-emerald-300">{campaignSuccess}</p> : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={savingCampaign}
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60"
              onClick={async () => {
                setSavingCampaign(true);
                setError(null);
                setCampaignSuccess(null);
                try {
                  await updateCampaign({
                    id: campaignId,
                    name: name.trim(),
                    slug: slug.trim(),
                    visibility,
                    description: description.trim(),
                  });
                  setCampaignSuccess("Campaign settings saved.");
                } catch (err: unknown) {
                  setError(err instanceof Error ? err.message : "Failed to save campaign");
                } finally {
                  setSavingCampaign(false);
                }
              }}
            >
              {savingCampaign ? "Saving…" : "Save campaign"}
            </button>
            {isOwner ? (
              <button
                type="button"
                className="rounded-md border border-red-900/50 px-4 py-2 text-sm text-red-300 hover:bg-red-950/40"
                onClick={async () => {
                  if (!window.confirm(`Delete campaign "${campaign.name}"?`)) return;
                  await removeCampaign({ id: campaignId });
                  router.push("/dashboard");
                }}
              >
                Delete campaign
              </button>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-medium text-white">Members</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Owners can change roles or remove members added through invite redemption.
          </p>
          <div className="mt-4 space-y-3">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3"
              >
                <div>
                  <p className="font-medium text-white">
                    {member.name || member.email || member.userId}
                  </p>
                  <p className="text-sm text-zinc-500">{member.email ?? "No email synced"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
                    value={member.role}
                    disabled={!isOwner || member.userId === campaign.ownerId}
                    onChange={(event) =>
                      void setMemberRole({
                        campaignId,
                        userId: member.userId,
                        role: event.target.value as MemberRole,
                      })
                    }
                  >
                    <option value="owner">Owner</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {isOwner && member.userId !== campaign.ownerId ? (
                    <button
                      type="button"
                      className="rounded-md border border-red-900/50 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40"
                      onClick={() =>
                        void removeMember({
                          campaignId,
                          userId: member.userId,
                        })
                      }
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6">
        <FieldDefinitionsEditor
          title="Campaign field schema"
          description="These fields apply across categories unless a category overrides them."
          fields={campaignFieldDrafts}
          onChange={setCampaignFieldDrafts}
          onSave={async () =>
            setCampaignFields({
              campaignId,
              fields: serializeFieldDrafts(campaignFieldDrafts),
            })
          }
        />
      </div>

      {campaign.visibility === "private" ? (
        <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-lg font-medium text-white">Private access</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Generate invite links, revoke them, and maintain an email allowlist for private access.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-md bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
              onClick={async () => {
                const result = await generateInvite({ campaignId });
                setInviteSecret(result.token);
              }}
            >
              Generate invite link
            </button>
            {inviteSecret ? (
              <code className="break-all rounded bg-zinc-950 px-3 py-2 text-xs text-amber-200">
                {origin}/join/{inviteSecret}
              </code>
            ) : null}
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-zinc-300">Invite tokens</h3>
              <div className="mt-3 space-y-2">
                {invites && invites.length > 0 ? (
                  invites.map((invite) => (
                    <div
                      key={invite._id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3"
                    >
                      <div className="text-sm text-zinc-400">
                        <p className="font-medium text-white">
                          {invite.label || `Invite ${invite._id.slice(0, 6)}`}
                        </p>
                        <p>
                          {invite.revoked
                            ? "Revoked"
                            : invite.expiresAt
                              ? `Expires ${new Date(invite.expiresAt).toLocaleString()}`
                              : "No expiry"}
                        </p>
                      </div>
                      {!invite.revoked ? (
                        <button
                          type="button"
                          className="rounded-md border border-red-900/50 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40"
                          onClick={() => void revokeInvite({ inviteId: invite._id })}
                        >
                          Revoke
                        </button>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">No invite links yet.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-300">Email allowlist</h3>
              <form
                className="mt-3 flex flex-wrap gap-2"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!email.trim()) return;
                  await addEmail({ campaignId, email: email.trim() });
                  setEmail("");
                }}
              >
                <input
                  type="email"
                  className="min-w-[220px] flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Allow access by email"
                />
                <button
                  type="submit"
                  className="rounded-md bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
                >
                  Add email
                </button>
              </form>
              <div className="mt-3 space-y-2">
                {allowlist && allowlist.length > 0 ? (
                  allowlist.map((entry) => (
                    <div
                      key={entry._id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3"
                    >
                      <span className="text-sm text-zinc-300">{entry.emailNormalized}</span>
                      <button
                        type="button"
                        className="rounded-md border border-red-900/50 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40"
                        onClick={() => void removeAllowlistEmail({ id: entry._id })}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">No allowlist entries yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-medium text-white">Categories</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Pick a category from the list, then edit its details, schema, and nominees in the panel.
        </p>

        <form
          className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-zinc-950/50 p-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!newCategoryTitle.trim()) return;
            const categoryId = await createCategory({
              campaignId,
              title: newCategoryTitle.trim(),
              description: newCategoryDescription.trim() || undefined,
              tags: parseTags(newCategoryTags),
              order: sortedCategories.length,
            });
            setSelectedCategoryId(categoryId);
            setNewCategoryTitle("");
            setNewCategoryDescription("");
            setNewCategoryTags("");
          }}
        >
          <div>
            <label className="text-sm text-zinc-400">Title</label>
            <input
              className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
              value={newCategoryTitle}
              onChange={(event) => setNewCategoryTitle(event.target.value)}
              placeholder="Best soundtrack"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Tags</label>
            <input
              className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
              value={newCategoryTags}
              onChange={(event) => setNewCategoryTags(event.target.value)}
              placeholder="music, game"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-zinc-400">Description</label>
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
              value={newCategoryDescription}
              onChange={(event) => setNewCategoryDescription(event.target.value)}
              placeholder="Describe what belongs in this category"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Add category
            </button>
          </div>
        </form>

        <div className="mt-5 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-3">
            <p className="px-2 pb-3 text-sm font-medium text-zinc-300">Category list</p>
            {sortedCategories.length === 0 ? (
              <p className="px-2 pb-2 text-sm text-zinc-500">No categories yet.</p>
            ) : (
              <div className="space-y-2">
                {sortedCategories.map((category) => {
                  const active = selectedCategory?._id === category._id;
                  return (
                    <button
                      key={category._id}
                      type="button"
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-amber-400/60 bg-amber-500/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                      onClick={() => setSelectedCategoryId(category._id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{category.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
                            {statusLabels[category.status]}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-400">
                          #{category.order}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div id={selectedCategory ? `category-${selectedCategory._id}` : undefined}>
            {selectedCategory ? (
              <CategoryCard campaignId={campaignId} category={selectedCategory} />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/40 p-8 text-zinc-400">
                Select a category to edit it.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

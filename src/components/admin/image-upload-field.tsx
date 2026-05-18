"use client";

import { Dialog } from "@base-ui/react/dialog";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import {
  RiCloseLine,
  RiImageAddLine,
  RiImageEditLine,
  RiLoader4Line,
} from "@remixicon/react";
import { useMutation } from "convex/react";
import { useCallback, useId, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { buildClientUploadPayload } from "@/lib/client-image-upload";
import { isAllowedImageFile } from "@/lib/crop-image";
import type { CropPercent } from "@/lib/crop-percent";
import { assessClientImageFile } from "@/lib/image-capabilities";
import { maxEdgeForAspect } from "@/lib/image-process-config";
import { logImageProcessing } from "@/lib/image-processing-log";
import type { ImageProcessingTarget } from "@/lib/image-processing-target";
import { processImageFromStorage } from "@/lib/process-image-from-storage";
import {
  fetchCropPreviewBlob,
  uploadOriginalToStorage,
} from "@/lib/stage-image-upload";
import { uploadImageBlob } from "@/lib/upload-convex-image";
import { cn } from "@/lib/utils";

const FILE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif";

export type ImageUploadFieldProps = {
  label: string;
  description?: string;
  imageUrl?: string | null;
  aspect: number;
  previewClassName?: string;
  disabled?: boolean;
  processingTarget: ImageProcessingTarget;
  /** Called with the processed storage id after crop succeeds. */
  onUpload: (storageId: Id<"_storage">) => Promise<void>;
  onRemove: () => Promise<void>;
};

export function ImageUploadField({
  label,
  description,
  imageUrl,
  aspect,
  previewClassName,
  disabled,
  processingTarget,
  onUpload,
  onRemove,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stagedStorageIdRef = useRef<Id<"_storage"> | null>(null);
  const originalFileRef = useRef<File | null>(null);
  const stagingGenerationRef = useRef(0);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const abandonStagedImage = useMutation(
    api.imageProcessing.abandonStagedImage,
  );

  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [useServerPipeline, setUseServerPipeline] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPercent, setCroppedAreaPercent] =
    useState<CropPercent | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  /** Crop % must match server-oriented preview (not raw browser decode). */
  const [previewSynced, setPreviewSynced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [cropError, setCropError] = useState<string | null>(null);

  const revokeImageSrc = useCallback((url: string | null) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const resetCropState = useCallback(() => {
    stagedStorageIdRef.current = null;
    originalFileRef.current = null;
    setUseServerPipeline(false);
    setImageSrc((current) => {
      revokeImageSrc(current);
      return null;
    });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPercent(null);
    setCroppedAreaPixels(null);
    setCropError(null);
    setPreviewSynced(false);
  }, [revokeImageSrc]);

  const closeCropDialog = useCallback(() => {
    const stagedId = stagedStorageIdRef.current;
    stagingGenerationRef.current += 1;
    setUploading(false);
    setCropOpen(false);
    resetCropState();
    if (stagedId) {
      void abandonStagedImage({ storageId: stagedId }).catch(() => {
        /* Staging file may already be linked or deleted */
      });
    }
  }, [abandonStagedImage, resetCropState]);

  const onCropComplete = useCallback((area: Area, pixels: Area) => {
    setCroppedAreaPercent(area);
    setCroppedAreaPixels(pixels);
  }, []);

  const abandonStaged = useCallback(
    (storageId: Id<"_storage"> | null) => {
      if (!storageId) {
        return;
      }
      void abandonStagedImage({ storageId }).catch(() => {
        /* Staging file may already be linked or deleted */
      });
    },
    [abandonStagedImage],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || disabled) return;

    if (!isAllowedImageFile(file)) {
      setFieldError("Use a JPEG, PNG, WebP, AVIF, or HEIC photo.");
      return;
    }

    setFieldError(null);
    resetCropState();
    setCropOpen(true);
    setUploading(true);
    setPreviewSynced(false);

    const generation = stagingGenerationRef.current + 1;
    stagingGenerationRef.current = generation;

    void (async () => {
      try {
        const assessment = await assessClientImageFile(file);
        const useServer = !assessment.canProcessInBrowser;
        if (stagingGenerationRef.current !== generation) {
          return;
        }

        setUseServerPipeline(useServer);
        logImageProcessing("pipeline-selected", {
          pipeline: useServer ? "server" : "client",
          fileName: file.name,
          fileType: file.type || "(empty)",
          fileSize: file.size,
          naturalWidth: assessment.naturalWidth,
          naturalHeight: assessment.naturalHeight,
        });

        if (!useServer) {
          originalFileRef.current = file;
          setImageSrc(URL.createObjectURL(file));
          setCrop({ x: 0, y: 0 });
          setZoom(1);
          setCroppedAreaPercent(null);
          setCroppedAreaPixels(null);
          setPreviewSynced(true);
          return;
        }

        originalFileRef.current = null;

        let stagedId: Id<"_storage"> | null = null;
        stagedId = await uploadOriginalToStorage(
          () => generateUploadUrl({}),
          file,
        );
        if (stagingGenerationRef.current !== generation) {
          abandonStaged(stagedId);
          return;
        }
        stagedStorageIdRef.current = stagedId;

        const previewBlob = await fetchCropPreviewBlob(stagedId);
        if (stagingGenerationRef.current !== generation) {
          abandonStaged(stagedStorageIdRef.current);
          stagedStorageIdRef.current = null;
          return;
        }
        setImageSrc((current) => {
          revokeImageSrc(current);
          return URL.createObjectURL(previewBlob);
        });
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPercent(null);
        setCroppedAreaPixels(null);
        setPreviewSynced(true);
      } catch (loadError) {
        if (stagingGenerationRef.current !== generation) {
          abandonStaged(stagedStorageIdRef.current);
          stagedStorageIdRef.current = null;
          return;
        }
        abandonStaged(stagedStorageIdRef.current);
        stagedStorageIdRef.current = null;
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Could not upload this photo.";
        setCropError(message);
      } finally {
        if (stagingGenerationRef.current === generation) {
          setUploading(false);
        }
      }
    })();
  };

  const handleSaveCrop = async () => {
    if (!imageSrc || !previewSynced || disabled || uploading) {
      return;
    }

    if (useServerPipeline) {
      const storageId = stagedStorageIdRef.current;
      if (!storageId || !croppedAreaPercent) {
        return;
      }
      setSaving(true);
      setCropError(null);
      setFieldError(null);
      try {
        const result = await processImageFromStorage(
          storageId,
          processingTarget,
          croppedAreaPercent,
          maxEdgeForAspect(aspect),
        );
        logImageProcessing("save-complete", {
          pipeline: "server",
          format: result.format,
          byteLength: result.byteLength,
          storageId: result.storageId,
          target: processingTarget.type,
        });
        stagedStorageIdRef.current = null;
        await onUpload(result.storageId);
        setCropOpen(false);
        resetCropState();
      } catch (saveError) {
        const message =
          saveError instanceof Error
            ? saveError.message
            : "Could not save photo.";
        setCropError(message);
        setFieldError(message);
      } finally {
        setSaving(false);
      }
      return;
    }

    const originalFile = originalFileRef.current;
    if (!croppedAreaPixels || !originalFile) {
      return;
    }

    setSaving(true);
    setCropError(null);
    setFieldError(null);
    try {
      const maxEdge = maxEdgeForAspect(aspect);
      const payload = await buildClientUploadPayload(
        originalFile,
        imageSrc,
        croppedAreaPixels,
        maxEdge,
      );

      const storageId = await uploadImageBlob(
        () => generateUploadUrl({}),
        payload.body,
      );
      logImageProcessing("save-complete", {
        pipeline: "client",
        uploadStrategy: payload.strategy,
        encodeFormat: payload.croppedBlob.type,
        encodeByteLength: payload.croppedBlob.size,
        encodeByteLengthMb: (payload.croppedBlob.size / 1024 / 1024).toFixed(2),
        format: payload.body.type,
        byteLength: payload.body.size,
        byteLengthMb: (payload.body.size / 1024 / 1024).toFixed(2),
        inputFileSize: originalFile.size,
        maxEdge,
        storageId,
        target: processingTarget.type,
      });
      await onUpload(storageId);
      setCropOpen(false);
      resetCropState();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Could not save photo.";
      setCropError(message);
      setFieldError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (disabled || saving) return;
    setSaving(true);
    setFieldError(null);
    try {
      await onRemove();
    } catch (removeError) {
      const message =
        removeError instanceof Error
          ? removeError.message
          : "Could not remove image.";
      setFieldError(message);
    } finally {
      setSaving(false);
    }
  };

  const saveDisabled =
    saving ||
    uploading ||
    !previewSynced ||
    !imageSrc ||
    (useServerPipeline
      ? !stagedStorageIdRef.current || !croppedAreaPercent
      : !croppedAreaPixels);

  return (
    <Field>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <FieldContent className="gap-3">
        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
        <div
          className={cn(
            "relative overflow-hidden border border-border bg-muted/40",
            previewClassName,
          )}
          style={{ aspectRatio: aspect }}
        >
          {imageUrl ? (
            <div
              className="size-full bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
              role="img"
              aria-label={label}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
              <RiImageAddLine className="size-8 opacity-60" aria-hidden />
              <span className="text-xs">No photo</span>
            </div>
          )}
          {saving ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 text-sm text-muted-foreground">
              <RiLoader4Line className="size-6 animate-spin" aria-hidden />
              Processing photo…
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept={FILE_ACCEPT}
            className="sr-only"
            disabled={disabled || saving}
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || saving}
            className="gap-1.5"
            onClick={() => fileInputRef.current?.click()}
          >
            {imageUrl ? (
              <RiImageEditLine className="size-4" aria-hidden />
            ) : (
              <RiImageAddLine className="size-4" aria-hidden />
            )}
            {imageUrl ? "Change photo" : "Add photo"}
          </Button>
          {imageUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || saving}
              onClick={() => void handleRemove()}
            >
              Remove
            </Button>
          ) : null}
        </div>
        {fieldError ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldError}
          </p>
        ) : null}
      </FieldContent>

      <Dialog.Root
        open={cropOpen}
        onOpenChange={(open) => {
          if (!open && saving) {
            return;
          }
          if (!open) {
            closeCropDialog();
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity supports-backdrop-filter:backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup
            className={cn(
              "fixed top-1/2 left-1/2 z-50 flex max-h-[min(90vh,40rem)] w-[min(calc(100%-2rem),28rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl",
              "transition duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
            )}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex flex-col gap-1">
                <Dialog.Title className="font-heading text-base font-medium">
                  Crop photo
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  Drag to frame your photo, then save.
                </Dialog.Description>
              </div>
              <Dialog.Close
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0"
                    disabled={saving}
                  />
                }
              >
                <RiCloseLine className="size-4" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>

            <div
              className="relative mx-auto w-full shrink-0 bg-muted"
              style={{
                aspectRatio: aspect,
                height: "min(50vh, 20rem)",
              }}
            >
              {imageSrc && previewSynced ? (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <RiLoader4Line
                    className="size-8 animate-spin opacity-70"
                    aria-hidden
                  />
                  <span className="text-sm">Preparing preview…</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 px-5 py-4">
              <label
                htmlFor={`${inputId}-zoom`}
                className="text-xs font-medium text-muted-foreground"
              >
                Zoom
              </label>
              <input
                id={`${inputId}-zoom`}
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                disabled={!previewSynced || saving}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {cropError ? (
              <p className="px-5 pb-2 text-sm text-destructive" role="alert">
                {cropError}
              </p>
            ) : null}

            <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={closeCropDialog}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={saveDisabled}
                onClick={() => void handleSaveCrop()}
              >
                {saving
                  ? "Processing…"
                  : uploading
                    ? "Uploading…"
                    : "Save photo"}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </Field>
  );
}

"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { RiImageAddLine, RiImageEditLine } from "@remixicon/react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getCroppedImageBlob } from "@/lib/crop-image";
import { uploadImageBlob } from "@/lib/upload-convex-image";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export type ImageUploadFieldProps = {
  label: string;
  description?: string;
  imageUrl?: string | null;
  aspect: number;
  previewClassName?: string;
  disabled?: boolean;
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
  onUpload,
  onRemove,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetCropState = useCallback(() => {
    setImageSrc((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError(null);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    resetCropState();
  }, [resetCropState]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || disabled) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Use a JPEG, PNG, WebP, or AVIF image.");
      return;
    }

    setError(null);
    resetCropState();
    setImageSrc(URL.createObjectURL(file));
    setSheetOpen(true);
  };

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels || disabled) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, {
        maxWidth: aspect >= 1 ? 1920 : 1200,
        mimeType: "image/webp",
        quality: 0.85,
      });
      const storageId = await uploadImageBlob(
        () => generateUploadUrl({}),
        blob,
      );
      await onUpload(storageId);
      closeSheet();
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload image.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (disabled || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onRemove();
    } catch (removeError) {
      const message =
        removeError instanceof Error
          ? removeError.message
          : "Could not remove image.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

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
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            disabled={disabled || busy}
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || busy}
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
              disabled={disabled || busy}
              onClick={() => void handleRemove()}
            >
              Remove
            </Button>
          ) : null}
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </FieldContent>

      <Sheet open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent side="bottom" className="max-h-[90vh] gap-0 p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Crop photo</SheetTitle>
            <SheetDescription>
              Drag to reposition. Exported as WebP for smaller file size.
            </SheetDescription>
          </SheetHeader>
          <div className="relative h-64 w-full bg-muted sm:h-80">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            ) : null}
          </div>
          <div className="flex flex-col gap-2 px-6 py-4">
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
              disabled={busy}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          {error ? (
            <p className="px-6 pb-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <SheetFooter className="flex-row justify-end border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={closeSheet}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy || !croppedAreaPixels}
              onClick={() => void handleSaveCrop()}
            >
              {busy ? "Saving…" : "Save photo"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Field>
  );
}

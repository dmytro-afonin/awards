"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

type BlobResult = {
  requested: string;
  actual: string;
  bytes: number;
  match: boolean;
  error?: string;
};

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<BlobResult> {
  const label =
    quality === undefined
      ? `${mime} (browser default)`
      : `${mime} q=${quality}`;
  return new Promise((resolve) => {
    const onBlob = (blob: Blob | null) => {
      if (!blob) {
        resolve({
          requested: label,
          actual: "",
          bytes: 0,
          match: false,
          error: "toBlob returned null",
        });
        return;
      }
      resolve({
        requested: label,
        actual: blob.type || "(empty)",
        bytes: blob.size,
        match: blob.type === mime,
      });
    };
    if (quality !== undefined) {
      canvas.toBlob(onBlob, mime, quality);
    } else {
      canvas.toBlob(onBlob, mime);
    }
  });
}

export default function HeicCanvasTestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<string | null>(null);
  const [results, setResults] = useState<BlobResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [userAgent, setUserAgent] = useState<string | null>(null);

  const onPick = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setLoadError(null);
    setResults(null);
    setNaturalSize(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const runExport = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!previewUrl || !canvas) return;

    setBusy(true);
    setLoadError(null);
    setResults(null);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Image failed to load in <img>"));
        img.src = previewUrl;
      });

      setNaturalSize(`${image.naturalWidth} × ${image.naturalHeight}`);

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get 2d context");
      }
      ctx.drawImage(image, 0, 0);

      setResults(
        await Promise.all([
          canvasToBlob(canvas, "image/jpeg"),
          canvasToBlob(canvas, "image/webp"),
          canvasToBlob(canvas, "image/avif"),
          canvasToBlob(canvas, "image/png"),
        ]),
      );
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }, [previewUrl]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← Admin
        </Link>
        <h1 className="font-heading text-lg font-medium">
          HEIC / canvas / toBlob
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick a photo (HEIC or JPEG). If the preview loads, we draw to canvas
          and call <code className="text-xs">toBlob</code> for JPEG / WebP /
          PNG. Compare requested MIME vs actual{" "}
          <code className="text-xs">blob.type</code> and size. Test in Safari
          with an iPhone HEIC.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setUserAgent(navigator.userAgent)}
        >
          Show user agent
        </Button>
        {userAgent ? (
          <p className="break-all text-xs text-muted-foreground">{userAgent}</p>
        ) : null}
      </div>

      <label className="flex w-fit cursor-pointer flex-col gap-1">
        <span className="text-sm font-medium">Choose file</span>
        <input
          type="file"
          accept="image/*,.heic,.heif"
          className="text-sm"
          onChange={onPick}
        />
      </label>

      {previewUrl ? (
        <div className="flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-64 w-full rounded-md border border-border object-contain bg-muted"
            onError={() =>
              setLoadError(
                "Preview failed — browser may not decode this HEIC (common in Chrome).",
              )
            }
          />
          {loadError ? (
            <p className="text-sm text-destructive" role="alert">
              {loadError}
            </p>
          ) : (
            <Button
              type="button"
              disabled={busy}
              onClick={() => void runExport()}
            >
              {busy ? "Exporting…" : "Draw to canvas & toBlob"}
            </Button>
          )}
        </div>
      ) : null}

      <canvas ref={canvasRef} className="hidden" aria-hidden />

      {naturalSize ? (
        <p className="text-sm text-muted-foreground">
          Natural size: {naturalSize}
        </p>
      ) : null}

      {results ? (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-2 font-medium">Requested</th>
              <th className="py-2 pr-2 font-medium">Actual type</th>
              <th className="py-2 pr-2 font-medium">Size</th>
              <th className="py-2 font-medium">OK?</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr
                key={`${row.requested}-${row.actual}-${row.bytes}`}
                className="border-b border-border/60"
              >
                <td className="py-2 pr-2 font-mono text-xs">{row.requested}</td>
                <td className="py-2 pr-2 font-mono text-xs">{row.actual}</td>
                <td className="py-2 pr-2">
                  {(row.bytes / 1024 / 1024).toFixed(2)} MB
                </td>
                <td className="py-2">
                  {row.match ? "✓" : `✗ ${row.error ?? "mismatch"}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}

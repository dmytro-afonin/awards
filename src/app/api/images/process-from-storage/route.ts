import { auth } from "@clerk/nextjs/server";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { parseCropPercent } from "@/lib/crop-percent";
import { parseImageProcessingTarget } from "@/lib/image-processing-target";
import { processStorageImageToSmallest } from "@/server/process-storage-image";

export const runtime = "nodejs";
/** AVIF effort 9 on large sources can take 15–60s+ */
export const maxDuration = 300;

async function createConvexClient(): Promise<ConvexHttpClient> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured.");
  }
  const authState = await auth();
  const token = await authState.getToken({ template: "convex" });
  if (!token) {
    throw new Error("Unauthorized");
  }
  const client = new ConvexHttpClient(url);
  client.setAuth(token);
  return client;
}

export async function POST(request: Request) {
  const authState = await auth();
  if (!authState.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const sourceStorageId = record.sourceStorageId;
  if (typeof sourceStorageId !== "string") {
    return Response.json(
      { error: "sourceStorageId is required." },
      { status: 400 },
    );
  }

  const target = parseImageProcessingTarget(record.target);
  if (!target) {
    return Response.json({ error: "Invalid target." }, { status: 400 });
  }

  const crop = parseCropPercent(record.crop);
  if (!crop) {
    return Response.json({ error: "Invalid crop." }, { status: 400 });
  }

  const maxEdge = Number(record.maxEdge ?? 1920);
  if (!Number.isFinite(maxEdge) || maxEdge < 1 || maxEdge > 8192) {
    return Response.json({ error: "Invalid maxEdge." }, { status: 400 });
  }

  let client: ConvexHttpClient;
  try {
    client = await createConvexClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return Response.json({ error: message }, { status: 401 });
  }

  let downloadUrl: string;
  try {
    downloadUrl = await client.mutation(
      api.imageProcessing.getStagedImageDownloadUrl,
      { storageId: sourceStorageId as Id<"_storage"> },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not access source image.";
    return Response.json({ error: message }, { status: 400 });
  }

  const fileResponse = await fetch(downloadUrl);
  if (!fileResponse.ok) {
    return Response.json(
      { error: "Could not download source image." },
      { status: 502 },
    );
  }

  let processedImage: Awaited<ReturnType<typeof processStorageImageToSmallest>>;
  try {
    const sourceBuffer = Buffer.from(await fileResponse.arrayBuffer());
    processedImage = await processStorageImageToSmallest(
      sourceBuffer,
      crop,
      maxEdge,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not process image.";
    return Response.json({ error: message }, { status: 422 });
  }

  let uploadUrl: string;
  try {
    uploadUrl = await client.mutation(
      api.imageProcessing.generateProcessingUploadUrl,
      { target },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not prepare upload.";
    return Response.json({ error: message }, { status: 400 });
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": processedImage.contentType },
    body: new Uint8Array(processedImage.buffer),
  });
  if (!uploadResponse.ok) {
    return Response.json(
      { error: "Could not store processed image." },
      { status: 502 },
    );
  }

  const uploadJson = (await uploadResponse.json()) as {
    storageId: Id<"_storage">;
  };

  try {
    await client.mutation(api.imageProcessing.completeImageProcessing, {
      target,
      sourceStorageId: sourceStorageId as Id<"_storage">,
      finalStorageId: uploadJson.storageId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not finalize image.";
    return Response.json({ error: message }, { status: 400 });
  }

  return Response.json({
    storageId: uploadJson.storageId,
    format: processedImage.format,
    byteLength: processedImage.byteLength,
  });
}

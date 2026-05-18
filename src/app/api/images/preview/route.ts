import { auth } from "@clerk/nextjs/server";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { bufferToDisplayJpeg } from "@/server/process-storage-image";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  const storageId =
    typeof body === "object" &&
    body !== null &&
    "storageId" in body &&
    typeof body.storageId === "string"
      ? body.storageId
      : null;
  if (!storageId) {
    return Response.json({ error: "storageId is required." }, { status: 400 });
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
      { storageId: storageId as Id<"_storage"> },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not access image.";
    return Response.json({ error: message }, { status: 400 });
  }

  const fileResponse = await fetch(downloadUrl);
  if (!fileResponse.ok) {
    return Response.json(
      { error: "Could not download image." },
      { status: 502 },
    );
  }

  try {
    const jpeg = await bufferToDisplayJpeg(
      Buffer.from(await fileResponse.arrayBuffer()),
    );
    return new Response(new Uint8Array(jpeg), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not prepare preview.";
    return Response.json({ error: message }, { status: 422 });
  }
}

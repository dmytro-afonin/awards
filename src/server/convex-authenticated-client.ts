import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

export async function createAuthenticatedConvexClient(): Promise<ConvexHttpClient> {
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

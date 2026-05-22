import type { Id } from "@cvx/_generated/dataModel";

export type ImageProcessingTarget =
  | { type: "workspace"; workspaceId: Id<"workspaces"> }
  | { type: "campaign"; campaignId: Id<"campaigns"> }
  | { type: "category"; categoryId: Id<"campaignCategories"> }
  | { type: "nominee"; nomineeId: Id<"campaignNominees"> };

export function parseImageProcessingTarget(
  raw: unknown,
): ImageProcessingTarget | null {
  if (typeof raw !== "object" || raw === null || !("type" in raw)) {
    return null;
  }
  const value = raw as Record<string, unknown>;
  switch (value.type) {
    case "workspace":
      return typeof value.workspaceId === "string"
        ? {
            type: "workspace",
            workspaceId: value.workspaceId as Id<"workspaces">,
          }
        : null;
    case "campaign":
      return typeof value.campaignId === "string"
        ? { type: "campaign", campaignId: value.campaignId as Id<"campaigns"> }
        : null;
    case "category":
      return typeof value.categoryId === "string"
        ? {
            type: "category",
            categoryId: value.categoryId as Id<"campaignCategories">,
          }
        : null;
    case "nominee":
      return typeof value.nomineeId === "string"
        ? {
            type: "nominee",
            nomineeId: value.nomineeId as Id<"campaignNominees">,
          }
        : null;
    default:
      return null;
  }
}

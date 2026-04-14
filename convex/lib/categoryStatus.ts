import type { Doc } from "../_generated/dataModel";

const order = ["draft", "active", "paused", "finished"] as const;

export type CategoryStatus = (typeof order)[number];

export function assertCategoryTransition(
  from: Doc<"categories">["status"],
  to: Doc<"categories">["status"]
) {
  if (from === to) return;
  const fi = order.indexOf(from);
  const ti = order.indexOf(to);
  if (fi === -1 || ti === -1) throw new Error("Invalid status");
  const allowed: Record<string, CategoryStatus[]> = {
    draft: ["active"],
    active: ["paused", "finished"],
    paused: ["active", "finished"],
    finished: [],
  };
  if (!allowed[from]?.includes(to)) {
    throw new Error(`Invalid transition ${from} → ${to}`);
  }
}

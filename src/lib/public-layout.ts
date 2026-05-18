/** Prototype layout keys for public campaign UI (?layout=). */
export const PUBLIC_LAYOUT_IDS = [
  "classic",
  "editorial",
  "arcade",
  "zen",
  "stadium",
  "story",
  "bureau",
  "festival",
] as const;

export type PublicLayoutId = (typeof PUBLIC_LAYOUT_IDS)[number];

export const PUBLIC_LAYOUT_META: Record<
  PublicLayoutId,
  { label: string; tagline: string }
> = {
  classic: { label: "Classic", tagline: "Simple grid (current)" },
  editorial: { label: "Editorial", tagline: "Magazine hero & typographic" },
  arcade: { label: "Arcade", tagline: "Gamified progress & neon" },
  zen: { label: "Zen", tagline: "Calm single-column flow" },
  stadium: { label: "Stadium", tagline: "Broadcast scoreboard dark" },
  story: { label: "Story", tagline: "Full-bleed immersive cards" },
  bureau: { label: "Bureau", tagline: "Swiss grid & sharp type" },
  festival: { label: "Festival", tagline: "Warm gradients & play" },
};

export function parsePublicLayout(
  value: string | null | undefined,
): PublicLayoutId | null {
  if (!value) {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (PUBLIC_LAYOUT_IDS.includes(normalized as PublicLayoutId)) {
    return normalized as PublicLayoutId;
  }
  return null;
}

export function cyclePublicLayout(
  current: PublicLayoutId,
  direction: 1 | -1,
): PublicLayoutId {
  const index = PUBLIC_LAYOUT_IDS.indexOf(current);
  const next =
    (index + direction + PUBLIC_LAYOUT_IDS.length) % PUBLIC_LAYOUT_IDS.length;
  return PUBLIC_LAYOUT_IDS[next] ?? "classic";
}

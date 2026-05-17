const MAX_CATEGORIES = 50;
const MAX_CATEGORY_LENGTH = 80;

export function normalizeCategories(
  raw: string[] | undefined,
): string[] | undefined {
  if (raw === undefined) {
    return undefined;
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const trimmed = item.trim();
    if (!trimmed || trimmed.length > MAX_CATEGORY_LENGTH) {
      continue;
    }
    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(trimmed);
    if (out.length >= MAX_CATEGORIES) {
      break;
    }
  }
  return out;
}

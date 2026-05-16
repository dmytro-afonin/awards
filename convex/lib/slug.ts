export function slugifyName(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.length > 0 ? base.slice(0, 48) : "campaign";
}

export function uniqueSlugSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

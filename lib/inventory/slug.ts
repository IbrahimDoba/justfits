// Stable, filename- and AI-friendly slug for an inventory product name.
// e.g. "Black/Blue Benz Cap (Patterns)" -> "black-blue-benz-cap-patterns"
export function inventorySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

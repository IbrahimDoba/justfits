// Shared fuzzy, token-based matching used by the storefront search and the
// Dailzero agent tools so both behave identically. Word order and spacing don't
// matter, and simple singular/plural forms match.

// Strip everything but a-z0-9 so "red bull" and "redbull" compare equal.
export const collapse = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Break a query into meaningful tokens (drops punctuation and 1-char noise).
export const tokenize = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);

// How many query tokens hit the haystack. A token hits if it appears in the
// haystack, in the space-collapsed haystack ("redbull" -> "red bull"), or as a
// simple singular/plural of a present word.
export function matchScore(haystack: string, tokens: string[]): number {
  const hay = haystack.toLowerCase();
  const collapsedHay = collapse(hay);
  let score = 0;
  for (const t of tokens) {
    const singular = t.endsWith("s") ? t.slice(0, -1) : t;
    if (
      hay.includes(t) ||
      collapsedHay.includes(collapse(t)) ||
      (singular.length >= 2 && hay.includes(singular)) ||
      hay.includes(`${t}s`)
    ) {
      score++;
    }
  }
  return score;
}

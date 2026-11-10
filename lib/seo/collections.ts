// Curated SEO collections served at /shop/<slug>. Each has its own title,
// copy and product match so the page is genuinely useful (not just a search).
// Client-safe: no Prisma imports (the footer and homepage link to these).

export interface Collection {
  slug: string;
  // Short name for links and breadcrumbs.
  name: string;
  // <title> (the site template appends "| JUSTFITS").
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  // Other slugs that render this collection (canonical stays on `slug`).
  aliases?: string[];
  // Either a category filter or a name/brand pattern.
  categorySlug?: string;
  match?: RegExp;
  related: string[];
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "f1",
    name: "F1 & Motorsport",
    metaTitle: "F1 Clothing in Nigeria: Team Shirts, Polos & Caps",
    metaDescription:
      "Shop F1 clothing in Nigeria: Ferrari, Mercedes-AMG Petronas, Red Bull Racing, McLaren and Aston Martin team shirts, polos and caps. Nationwide delivery.",
    h1: "F1 & Motorsport Clothing",
    intro:
      "Team shirts, polos, driver tees and caps from across the Formula 1 grid: Scuderia Ferrari, Mercedes-AMG Petronas, Red Bull Racing, McLaren and Aston Martin. Pick your team and wear it every day, with delivery anywhere in Nigeria.",
    aliases: ["f1-clothing", "formula-1", "motorsport"],
    match:
      /\bf1\b|formula|petronas|scuderia|ferrari|red bull|mclaren|aston martin|driver|team|hamilton/i,
    related: ["ferrari", "mercedes", "red-bull", "caps"],
  },
  {
    slug: "ferrari",
    name: "Ferrari",
    metaTitle: "Ferrari Shirts, Hoodies & Caps in Nigeria",
    metaDescription:
      "Scuderia Ferrari shirts, the red Ferrari hoodie, Puma x Ferrari and Lewis Hamilton 44 caps. Shop Ferrari clothing at JUSTFITS with delivery across Nigeria.",
    h1: "Ferrari Collection",
    intro:
      "The prancing horse, in red, black and white. Scuderia Ferrari team tees, the red Ferrari hoodie, and caps including Puma x Ferrari and Lewis Hamilton's 44. Made for Tifosi everywhere, delivered anywhere in Nigeria.",
    aliases: ["scuderia-ferrari", "ferrari-clothing"],
    match: /ferrari|scuderia|\bsf\b/i,
    related: ["f1", "mercedes", "red-bull", "caps"],
  },
  {
    slug: "mercedes",
    name: "Mercedes-Benz & AMG",
    metaTitle: "Mercedes-Benz & AMG Petronas Caps and Shirts in Nigeria",
    metaDescription:
      "Mercedes-Benz caps, AMG Petronas F1 polos, team shirts and driver tees. Shop the three-pointed star at JUSTFITS with nationwide delivery in Nigeria.",
    h1: "Mercedes-Benz & AMG",
    intro:
      "Our biggest collection. Benz caps in every colourway, AMG Petronas F1 caps and polos, team shirts and driver tees for anyone who knows the three-pointed star. Delivered across Nigeria.",
    aliases: ["benz", "mercedes-benz", "amg", "amg-petronas", "mercedes-f1"],
    match: /benz|mercedes|mercadez|\bamg\b|petronas/i,
    related: ["f1", "bmw", "ferrari", "caps"],
  },
  {
    slug: "bmw",
    name: "BMW M",
    metaTitle: "BMW Motorsport Shirts & Caps in Nigeria",
    metaDescription:
      "BMW M Motorsport shirts and caps for BMW people. Shop BMW clothing at JUSTFITS with delivery across Nigeria.",
    h1: "BMW M Motorsport",
    intro:
      "For BMW people. M Motorsport shirts and BMW caps in black and white, carrying the M stripes. Delivered anywhere in Nigeria.",
    aliases: ["bmw-motorsport", "bmw-m"],
    match: /\bbmw\b/i,
    related: ["mercedes", "f1", "caps", "shirts"],
  },
  {
    slug: "red-bull",
    name: "Red Bull Racing",
    metaTitle: "Red Bull Racing F1 Shirts, Polos & Caps in Nigeria",
    metaDescription:
      "Oracle Red Bull Racing team shirts, polos and caps. Shop Red Bull F1 clothing at JUSTFITS with nationwide delivery in Nigeria.",
    h1: "Red Bull Racing",
    intro:
      "Oracle Red Bull Racing team tees, polos and caps in navy, blue and red. Rep the Milton Keynes team on and off race weekend, delivered across Nigeria.",
    aliases: ["redbull", "red-bull-racing"],
    match: /red ?bull/i,
    related: ["f1", "ferrari", "mercedes", "shirts"],
  },
  {
    slug: "caps",
    name: "Caps",
    metaTitle: "F1 & Car Caps in Nigeria: Benz, Ferrari, BMW & More",
    metaDescription:
      "Motorsport and car caps in Nigeria: Mercedes-Benz, AMG Petronas, Ferrari, BMW, Aston Martin, McLaren, Honda and Toyota. Shop caps at JUSTFITS.",
    h1: "Motorsport & Car Caps",
    intro:
      "Where JUSTFITS started. Caps for every badge: Mercedes-Benz and AMG Petronas, Ferrari, BMW, Aston Martin, McLaren, Honda, Toyota and more. One size, delivered across Nigeria.",
    aliases: ["racing-caps", "f1-caps"],
    categorySlug: "caps",
    related: ["mercedes", "ferrari", "bmw", "f1"],
  },
  {
    slug: "shirts",
    name: "Shirts & Polos",
    metaTitle: "Motorsport Shirts, F1 Polos & Hoodies in Nigeria",
    metaDescription:
      "F1 team shirts, polos, driver tees and hoodies: Ferrari, Mercedes-AMG Petronas, Red Bull Racing, BMW M and Aston Martin. Shop at JUSTFITS, delivered in Nigeria.",
    h1: "Motorsport Shirts & Polos",
    intro:
      "F1 team tees, polos, driver long sleeves and hoodies from Ferrari, Mercedes-AMG Petronas, Red Bull Racing, Aston Martin and BMW M. Sizes run from L to 4XL, delivered anywhere in Nigeria.",
    aliases: ["motorsport-shirts", "f1-shirts", "polos"],
    categorySlug: "shirts",
    related: ["f1", "ferrari", "mercedes", "red-bull"],
  },
];

export function findCollection(slug: string): Collection | null {
  const s = slug.toLowerCase();
  return (
    COLLECTIONS.find((c) => c.slug === s || c.aliases?.includes(s)) ?? null
  );
}

export function collectionMatches(
  c: Collection,
  p: { name: string; brand?: string | null; categorySlug: string }
) {
  if (c.categorySlug) return p.categorySlug === c.categorySlug;
  return !!c.match?.test(`${p.name} ${p.brand ?? ""}`);
}

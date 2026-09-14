import { prisma } from "@/lib/db/prisma";
import { inventorySlug } from "@/lib/inventory/slug";

// Read-only catalogue shaped for the Dailzero WhatsApp agent.
// Sourced live from inventory (the single source of truth). Exposes ONLY
// customer-safe fields — never cost price.

const CAT: Record<string, string> = { CAP: "Cap", SHIRT: "Shirt", OTHER: "Item" };
const SITE = "https://justfitsng.com";

export interface AgentSize {
  size: string;
  inStock: boolean;
  quantity: number;
}

export interface AgentProduct {
  slug: string;
  name: string;
  brand: string | null;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  inStock: boolean;
  totalStock: number;
  sizes: AgentSize[];
  image: string | null;
  productUrl: string;
}

interface Group {
  name: string;
  brand: string | null;
  category: string;
  imageUrl: string | null;
  prices: number[];
  sizes: AgentSize[];
  totalStock: number;
}

async function getGroups(): Promise<Group[]> {
  const items = await prisma.inventoryItem.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      name: true,
      brand: true,
      category: true,
      size: true,
      quantity: true,
      sellingPrice: true,
      imageUrl: true,
    },
  });

  const map = new Map<string, Group>();
  for (const i of items) {
    const g =
      map.get(i.name) ??
      ({
        name: i.name,
        brand: i.brand,
        category: i.category,
        imageUrl: null,
        prices: [],
        sizes: [],
        totalStock: 0,
      } satisfies Group);
    if (!g.imageUrl && i.imageUrl) g.imageUrl = i.imageUrl;
    if (i.sellingPrice != null) g.prices.push(Number(i.sellingPrice));
    if (i.size) {
      g.sizes.push({
        size: i.size,
        inStock: i.quantity > 0,
        quantity: i.quantity,
      });
    }
    g.totalStock += i.quantity;
    map.set(i.name, g);
  }
  return Array.from(map.values());
}

function toProduct(g: Group): AgentProduct {
  return {
    slug: inventorySlug(g.name),
    name: g.name,
    brand: g.brand,
    category: CAT[g.category] ?? "Item",
    priceMin: g.prices.length ? Math.min(...g.prices) : null,
    priceMax: g.prices.length ? Math.max(...g.prices) : null,
    inStock: g.totalStock > 0,
    totalStock: g.totalStock,
    sizes: g.sizes.sort((a, b) => a.size.localeCompare(b.size)),
    image: g.imageUrl,
    productUrl: `${SITE}/products/${inventorySlug(g.name)}`,
  };
}

// Search across name + brand. Returns only in-stock products by default.
export async function searchAgentProducts(
  q: string,
  { limit = 8, includeOutOfStock = false } = {}
): Promise<AgentProduct[]> {
  const groups = await getGroups();
  const query = q.toLowerCase().trim();
  return groups
    .filter((g) => (includeOutOfStock ? true : g.totalStock > 0))
    .filter(
      (g) =>
        !query ||
        g.name.toLowerCase().includes(query) ||
        (g.brand || "").toLowerCase().includes(query)
    )
    .slice(0, Math.min(limit, 20))
    .map(toProduct);
}

export async function getAgentProductBySlug(
  slug: string
): Promise<AgentProduct | null> {
  const groups = await getGroups();
  const g = groups.find((x) => inventorySlug(x.name) === slug);
  return g ? toProduct(g) : null;
}

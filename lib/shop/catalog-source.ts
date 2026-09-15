import { prisma } from "@/lib/db/prisma";
import { inventorySlug } from "@/lib/inventory/slug";

// Maps inventory (the single source of truth) into the shape the storefront
// shop endpoints already use, so /shop, product detail pages and categories
// are driven by inventory without duplicating data.

const CAT: Record<string, { name: string; slug: string }> = {
  CAP: { name: "Caps", slug: "caps" },
  SHIRT: { name: "Shirts", slug: "shirts" },
  OTHER: { name: "Other", slug: "other" },
};

export interface ShopListProduct {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  images: string[];
  category: string;
  categorySlug: string;
  sizes: string[];
  inStock: boolean;
  featured: boolean;
  variants: never[];
  hasImage: boolean;
}

interface Group {
  name: string;
  brand: string | null;
  description: string | null;
  category: string;
  imageUrl: string | null;
  prices: number[];
  variants: { id: string; size: string | null; price: number; stock: number }[];
  totalStock: number;
}

async function getInventoryGroups(): Promise<Group[]> {
  // Only the cover (imageUrl) is needed for lists/catalogue — never fetch the
  // full images[] gallery here (keeps data transfer minimal).
  const items = await prisma.inventoryItem.findMany({
    where: { isActive: true, quantity: { gt: 0 } },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      brand: true,
      description: true,
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
      {
        name: i.name,
        brand: i.brand,
        description: i.description,
        category: i.category,
        imageUrl: null,
        prices: [],
        variants: [],
        totalStock: 0,
      };
    if (!g.imageUrl && i.imageUrl) g.imageUrl = i.imageUrl;
    const price = i.sellingPrice != null ? Number(i.sellingPrice) : 0;
    if (i.sellingPrice != null) g.prices.push(price);
    g.variants.push({ id: i.id, size: i.size, price, stock: i.quantity });
    g.totalStock += i.quantity;
    map.set(i.name, g);
  }
  return Array.from(map.values());
}

const cat = (c: string) => CAT[c] ?? CAT.OTHER;
const lowest = (prices: number[]) => (prices.length ? Math.min(...prices) : 0);

export async function getInventoryListProducts(): Promise<ShopListProduct[]> {
  const groups = await getInventoryGroups();
  return groups.map((g) => ({
    id: `inv_${inventorySlug(g.name)}`,
    name: g.name,
    slug: inventorySlug(g.name),
    brand: g.brand,
    description: "",
    price: lowest(g.prices),
    compareAtPrice: null,
    image: g.imageUrl,
    images: g.imageUrl ? [g.imageUrl] : [],
    category: cat(g.category).name,
    categorySlug: cat(g.category).slug,
    sizes: [],
    inStock: g.totalStock > 0,
    featured: false,
    variants: [],
    hasImage: !!g.imageUrl,
  }));
}

export async function getInventoryCategories() {
  const groups = await getInventoryGroups();
  const counts: Record<string, number> = {};
  for (const g of groups) {
    const s = cat(g.category).slug;
    counts[s] = (counts[s] ?? 0) + 1;
  }
  return Object.entries(counts).map(([slug, productCount]) => ({
    id: slug,
    name: slug === "caps" ? "Caps" : slug === "shirts" ? "Shirts" : "Other",
    slug,
    productCount,
  }));
}

export async function getInventoryProductBySlug(slug: string) {
  const groups = await getInventoryGroups();
  const g = groups.find((x) => inventorySlug(x.name) === slug);
  if (!g) return null;

  // Fetch the gallery only for this one product (not for every list request).
  const withImages = await prisma.inventoryItem.findFirst({
    where: { name: g.name, images: { isEmpty: false } },
    select: { images: true },
  });
  const gallery = withImages?.images?.length
    ? withImages.images
    : g.imageUrl
      ? [g.imageUrl]
      : [];

  const variants = g.variants.map((v) => ({
    id: v.id,
    sku: v.id,
    name: g.name,
    size: v.size ?? "One Size",
    color: "",
    price: v.price,
    compareAtPrice: null as number | null,
    stockQuantity: v.stock,
  }));

  const kind = g.category === "SHIRT" ? "shirt" : g.category === "CAP" ? "cap" : "piece";
  const sizeList = g.variants
    .map((v) => v.size)
    .filter((s): s is string => !!s);
  // Use the saved (or AI-generated) caption when present, else a sensible default.
  const description =
    g.description?.trim() ||
    [
      g.brand
        ? `Premium ${g.brand} ${kind} from JUSTFITS.`
        : `Premium car-themed ${kind} from JUSTFITS.`,
      sizeList.length ? `Available sizes: ${sizeList.join(", ")}.` : "",
      "Message us on WhatsApp to order — we'll confirm your size, payment and delivery.",
    ]
      .filter(Boolean)
      .join(" ");

  const product = {
    id: `inv_${slug}`,
    name: g.name,
    slug,
    description,
    price: lowest(g.prices),
    compareAtPrice: null as number | null,
    images: gallery,
    category: cat(g.category).name,
    categorySlug: cat(g.category).slug,
    sizes: g.variants.map((v) => v.size ?? "One Size"),
    inStock: g.totalStock > 0,
    featured: false,
    variants,
    reviews: [] as {
      id: string;
      rating: number;
      title: string | null;
      comment: string;
      isVerified: boolean;
      createdAt: string;
      user: { id: string; name: string | null; image: string | null };
    }[],
    avgRating: 0,
    reviewCount: 0,
    ratingDistribution: [0, 0, 0, 0, 0],
    metaTitle: null as string | null,
    metaDescription: null as string | null,
    source: "inventory" as const,
  };

  const relatedProducts = groups
    .filter((x) => x.category === g.category && x.name !== g.name)
    .slice(0, 4)
    .map((x) => ({
      id: `inv_${inventorySlug(x.name)}`,
      name: x.name,
      slug: inventorySlug(x.name),
      price: lowest(x.prices),
      image: x.imageUrl,
      category: cat(x.category).name,
      inStock: x.totalStock > 0,
      sizes: [] as string[],
    }));

  return { product, relatedProducts };
}

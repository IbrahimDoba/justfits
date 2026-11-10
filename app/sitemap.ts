import { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { siteConfig } from "@/config/siteConfig";
import { inventorySlug } from "@/lib/inventory/slug";
import { COLLECTIONS } from "@/lib/seo/collections";

// Regenerate hourly so new stock appears without a deploy.
export const revalidate = 3600;

const baseUrl = siteConfig.url.replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ─── Static pages ────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ─── Product pages (inventory is the source of truth) ─────────────────────────
  // Sold-out products still render (as "sold out"), so they stay listed.
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const items = await prisma.inventoryItem.groupBy({
      by: ["name"],
      where: { isActive: true },
      _max: { updatedAt: true },
      _sum: { quantity: true },
    });
    productPages = items.map((i) => ({
      url: `${baseUrl}/products/${inventorySlug(i.name)}`,
      lastModified: i._max.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: (i._sum.quantity ?? 0) > 0 ? 0.85 : 0.4,
    }));
  } catch {
    // DB unavailable at build time: skip product pages gracefully
  }

  // ─── Curated collection pages ─────────────────────────────────────────────────
  const collectionPages: MetadataRoute.Sitemap = COLLECTIONS.map((c) => ({
    url: `${baseUrl}/shop/${c.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...collectionPages, ...productPages];
}

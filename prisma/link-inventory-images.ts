import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { inventorySlug } from "../lib/inventory/slug";

// Usage:
//   IMAGES_DIR=~/Downloads/justfits-images \
//   DATABASE_URL="$DATABASE_URL_PROD" \
//   npx tsx prisma/link-inventory-images.ts
//
// Each image file must be named by its product slug (see inventory-image-manifest.json),
// e.g. "scuderia-ferrari-2026-t-shirt-red.jpg". The script uploads each to
// Cloudinary at justfits/inventory/<slug> and sets imageUrl on every inventory
// row for that product (all sizes).

if (process.env.CLOUDINARY_URL) {
  cloudinary.config(true);
} else {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
});

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

async function main() {
  const dir = process.env.IMAGES_DIR;
  if (!dir || !fs.existsSync(dir)) {
    console.error(`IMAGES_DIR not set or not found: ${dir}`);
    process.exit(1);
  }

  const items = await prisma.inventoryItem.findMany({ select: { name: true } });
  const names = Array.from(new Set(items.map((i) => i.name)));
  const slugToNames = new Map<string, string[]>();
  for (const n of names) {
    const s = inventorySlug(n);
    slugToNames.set(s, [...(slugToNames.get(s) ?? []), n]);
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));

  let linked = 0;
  const unmatchedFiles: string[] = [];
  const matchedSlugs = new Set<string>();

  for (const file of files) {
    const slug = inventorySlug(path.basename(file, path.extname(file)));
    const productNames = slugToNames.get(slug);
    if (!productNames) {
      unmatchedFiles.push(file);
      continue;
    }
    const res = await cloudinary.uploader.upload(path.join(dir, file), {
      public_id: `justfits/inventory/${slug}`,
      overwrite: true,
      resource_type: "image",
    });
    const updated = await prisma.inventoryItem.updateMany({
      where: { name: { in: productNames } },
      data: { imageUrl: res.secure_url },
    });
    matchedSlugs.add(slug);
    linked += updated.count;
    console.log(`✓ ${file} -> ${productNames.join(" / ")} (${updated.count} rows)`);
  }

  const missing = names.filter((n) => !matchedSlugs.has(inventorySlug(n)));
  console.log(`\nDone. Linked ${linked} inventory rows from ${matchedSlugs.size} images.`);
  if (unmatchedFiles.length)
    console.log(`Unmatched files (no product slug): ${unmatchedFiles.join(", ")}`);
  if (missing.length)
    console.log(`\nProducts still without an image (${missing.length}):\n  ${missing.join("\n  ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

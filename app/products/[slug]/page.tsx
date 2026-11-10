import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data/product";
import { ProductDetailClient } from "./ProductDetailClient";
import { siteConfig } from "@/config/siteConfig";
import { findCollection } from "@/lib/seo/collections";
import { JsonLd, breadcrumbLd, productLd } from "@/lib/seo/jsonld";

// ~155 chars on a word boundary, for search snippets.
function snippet(text: string, max = 155) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(" ", max)).replace(/[,.;:]$/, "") + "…";
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);

  if (!data || !data.product) {
    return {
      title: "Product Not Found",
    };
  }

  const { product } = data;
  // The root title template already appends "| JUSTFITS".
  const title = product.metaTitle || product.name;
  const description = snippet(product.metaDescription || product.description);
  const url = `/products/${product.slug}`;
  const image = product.images[0] || siteConfig.ogImage;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);

  if (!data || !data.product) {
    notFound();
  }

  const { product } = data;
  const collection = findCollection(product.categorySlug);
  return (
    <>
      <JsonLd
        data={[
          productLd(product),
          breadcrumbLd([
            { name: "Home", path: "/" },
            {
              name: collection?.name ?? "Shop",
              path: collection ? `/shop/${collection.slug}` : "/shop",
            },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
        ]}
      />
      <ProductDetailClient
        product={data.product}
        relatedProducts={data.relatedProducts}
      />
    </>
  );
}

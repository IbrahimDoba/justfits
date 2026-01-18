import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data/product";
import { ProductDetailClient } from "./ProductDetailClient";
import { siteConfig } from "@/config/siteConfig";

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
  const title = product.metaTitle || `${product.name} | ${siteConfig.name}`;
  const description = product.metaDescription || product.description;
  const image = product.images[0] || siteConfig.ogImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteConfig.url}/products/${product.slug}`,
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

  return (
    <ProductDetailClient
      product={data.product}
      relatedProducts={data.relatedProducts}
    />
  );
}

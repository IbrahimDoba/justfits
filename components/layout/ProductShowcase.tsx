"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useFeaturedProducts } from "@/lib/hooks/useFeaturedProducts";
import { getImageBlurDataURL, shouldPrioritizeImage } from "@/lib/utils/imageBlur";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

export function ProductShowcase() {
  // Use query hook for featured products
  const { data: products = [], isLoading } = useFeaturedProducts(8);

  if (isLoading) {
    return (
      <section className="relative py-8 sm:py-12 md:py-24 lg:py-32 bg-white overflow-hidden">
        <div className="container px-4 sm:px-6 flex justify-center items-center min-h-[200px] sm:min-h-[300px] md:min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="relative py-8 sm:py-12 md:py-24 lg:py-32 bg-white overflow-hidden">
      {/* Section Header */}
      <div className="container px-4 sm:px-6 mb-6 sm:mb-8 md:mb-16">
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-body uppercase tracking-[0.2em] sm:tracking-[0.3em] text-black/40 mb-2 md:mb-4">
                The Collection
              </p>
              <h2 className="font-script text-3xl sm:text-4xl md:text-5xl lg:text-6xl italic text-black">
                Caps That Define Your Drive
              </h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-body uppercase tracking-wider text-black/50 hover:text-black transition-colors shrink-0"
            >
              View All
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </ScrollReveal>
      </div>

      {/* Bento Grid */}
      <div className="container px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {/* Large Card - First Product */}
          {products[0] && (
            <ScrollReveal
              direction="up"
              delay={0.1}
              className="sm:col-span-2 lg:row-span-2"
            >
              <ProductCard product={products[0]} variant="large" />
            </ScrollReveal>
          )}

          {/* Medium Cards */}
          {products[1] && (
            <ScrollReveal direction="up" delay={0.2}>
              <ProductCard product={products[1]} variant="medium" />
            </ScrollReveal>
          )}

          {products[2] && (
            <ScrollReveal direction="up" delay={0.3}>
              <ProductCard product={products[2]} variant="medium" />
            </ScrollReveal>
          )}

          {/* Small Cards */}
          {products[3] && (
            <ScrollReveal direction="up" delay={0.4}>
              <ProductCard product={products[3]} variant="small" />
            </ScrollReveal>
          )}

          {products[4] && (
            <ScrollReveal direction="up" delay={0.5}>
              <ProductCard product={products[4]} variant="small" />
            </ScrollReveal>
          )}

          {/* Wide Card - Bottom */}
          {products[5] && (
            <ScrollReveal direction="up" delay={0.6} className="sm:col-span-2">
              <ProductCard product={products[5]} variant="wide" />
            </ScrollReveal>
          )}

          {/* Medium Cards - Additional */}
          {products[6] && (
            <ScrollReveal direction="up" delay={0.7}>
              <ProductCard product={products[6]} variant="medium" />
            </ScrollReveal>
          )}

          {products[7] && (
            <ScrollReveal direction="up" delay={0.8}>
              <ProductCard product={products[7]} variant="medium" />
            </ScrollReveal>
          )}
        </div>
      </div>

      {/* Editorial Quote */}
      <div className="container px-4 sm:px-6 mt-8 sm:mt-12 md:mt-16 lg:mt-24">
        <ScrollReveal direction="up">
          <div className="mx-auto text-center max-w-3xl">
            <p className="font-script text-lg sm:text-xl md:text-2xl lg:text-3xl italic text-black/50 leading-relaxed px-2 sm:px-4">
              &ldquo;Every cap tells a story of craftsmanship, precision, and
              the relentless pursuit of excellence.&rdquo;
            </p>
            <p className="mt-3 sm:mt-4 md:mt-6 text-xs sm:text-sm font-body uppercase tracking-wider text-black/30">
              — JustFits Design Philosophy
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

interface ProductCardProps {
  product: Product;
  variant: "large" | "medium" | "small" | "wide";
}

function ProductCard({ product, variant }: ProductCardProps) {
  const aspectRatio = {
    large: "aspect-[1/1] sm:aspect-[3/4] md:aspect-[4/5]",
    medium: "aspect-[1/1] sm:aspect-[3/4] md:aspect-[4/5]",
    small: "aspect-[1/1] sm:aspect-[3/4] md:aspect-[4/5]",
    wide: "aspect-[3/2] sm:aspect-[2/1]",
  }[variant];

  const maxHeight = {
    large: "max-h-[300px] sm:max-h-[400px] md:max-h-none",
    medium: "max-h-[300px] sm:max-h-[400px] md:max-h-none",
    small: "max-h-[300px] sm:max-h-[400px] md:max-h-none",
    wide: "max-h-[200px] sm:max-h-[300px] md:max-h-none",
  }[variant];

  return (
    <Link href={`/products/${product.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className={`group relative ${aspectRatio} ${maxHeight} bg-gray-100 rounded-lg overflow-hidden cursor-pointer w-full h-full`}
      >
        {/* Product Image */}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            placeholder="blur"
            blurDataURL={getImageBlurDataURL(product.image)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Content */}
        <div className="absolute inset-0 z-20 p-3 sm:p-4 md:p-6 flex flex-col justify-end">
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-body text-sm sm:text-base md:text-lg font-medium text-white mb-0.5 sm:mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-white/70">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

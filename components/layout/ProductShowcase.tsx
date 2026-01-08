"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ArrowUpRight, Loader2 } from "lucide-react";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products?limit=8&sort=featured");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="relative py-24 md:py-32 bg-white overflow-hidden">
        <div className="container px-6 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Section Header */}
      <div className="container px-6 mb-16">
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1">
              <p className="text-sm font-body uppercase tracking-[0.3em] text-black/40 mb-4">
                The Collection
              </p>
              <h2 className="font-script text-4xl md:text-5xl lg:text-6xl italic text-black">
                Caps That Define Your Drive
              </h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-sm font-body uppercase tracking-wider text-black/50 hover:text-black transition-colors shrink-0"
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
      <div className="container px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Large Card - First Product */}
          {products[0] && (
            <ScrollReveal
              direction="up"
              delay={0.1}
              className="lg:col-span-2 lg:row-span-2"
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
            <ScrollReveal direction="up" delay={0.6} className="md:col-span-2">
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
      <div className="container px-6 mt-24">
        <ScrollReveal direction="up">
          <div className="mx-auto text-center max-w-3xl">
            <p className="font-script text-2xl md:text-3xl italic text-black/50 leading-relaxed">
              &ldquo;Every cap tells a story of craftsmanship, precision, and
              the relentless pursuit of excellence.&rdquo;
            </p>
            <p className="mt-6 text-sm font-body uppercase tracking-wider text-black/30">
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
    large: "aspect-[4/5]",
    medium: "aspect-[4/5]",
    small: "aspect-[4/5]",
    wide: "aspect-[2/1]",
  }[variant];

  return (
    <Link href={`/products/${product.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className={`group relative ${aspectRatio} bg-gray-100 rounded-lg overflow-hidden cursor-pointer w-full h-full`}
      >
        {/* Product Image */}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Content */}
        <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end">
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-body text-lg font-medium text-white mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-white/70">{formatPrice(product.price)}</p>
          </div>

          {/* View Button - Appears on Hover */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            className="mt-4 py-3 px-6 bg-white text-black text-sm font-body font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 text-center"
          >
            View Product
          </motion.span>
        </div>
      </motion.div>
    </Link>
  );
}

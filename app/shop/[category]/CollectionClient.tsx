"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { SlidersHorizontal, Loader2, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useProducts } from "@/lib/hooks/useProducts";
import { SHOP_PAGE_LIMIT } from "@/lib/shop/defaults";
import type { PublicListProduct } from "@/lib/shop/list";

const DEFAULT_SORT = "featured";
const PRIORITY_CARDS = 4;

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

// A slug is either a real category (caps/shirts) or a brand/keyword like
// "benz" or "red-bull". The server resolves which and renders the first
// view; this component only handles re-sorting.
export function CollectionClient({
  title,
  categorySlug,
  searchTerm,
  initialProducts,
}: {
  title: string;
  categorySlug: string | null;
  searchTerm: string;
  initialProducts?: PublicListProduct[];
}) {
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [interacted, setInteracted] = useState(false);
  const isBrandSearch = !categorySlug;

  const { data: products = [], isLoading } = useProducts({
    category: categorySlug ?? "all",
    search: isBrandSearch ? searchTerm : "",
    sort: sortBy,
    limit: SHOP_PAGE_LIMIT,
    initialData: sortBy === DEFAULT_SORT ? initialProducts : undefined,
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumbs */}
      <section className="pt-24 pb-6 bg-white">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/"
              className="hover:text-black transition-colors flex items-center gap-1"
            >
              <Home size={16} />
              Home
            </Link>
            <ChevronRight size={16} />
            <Link href="/shop" className="hover:text-black transition-colors">
              Shop
            </Link>
            <ChevronRight size={16} />
            <span className="text-black font-medium">{title}</span>
          </nav>
        </div>
      </section>

      {/* Header */}
      <section className="pb-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-5xl md:text-7xl text-black tracking-tight mb-6">
              {title}
            </h1>
            <p className="text-sm text-gray-500 mt-4">
              {isLoading ? (
                "Loading…"
              ) : (
                <>
                  {products.length}{" "}
                  {products.length === 1 ? "product" : "products"}
                  {isBrandSearch ? ` matching “${title}”` : ""}
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {/* Sort */}
          <div className="flex items-center justify-end gap-3 mb-12">
            <SlidersHorizontal size={18} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => {
                setInteracted(true);
                setSortBy(e.target.value);
              }}
              aria-label="Sort products"
              className="bg-white border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="featured">
                {isBrandSearch ? "Best match" : "Featured"}
              </option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <motion.div
                key={sortBy}
                variants={staggerContainer}
                initial={interacted ? "hidden" : false}
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8"
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={fadeInUp}
                    custom={index}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard
                      title={product.name}
                      price={formatPrice(product.price)}
                      compareAtPrice={
                        product.compareAtPrice
                          ? formatPrice(product.compareAtPrice)
                          : undefined
                      }
                      slug={product.slug}
                      image={product.image}
                      inStock={product.inStock}
                      layout="grid"
                      priority={!interacted && index < PRIORITY_CARDS}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {products.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">
                    No products found for “{title}”.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-4 inline-block text-black underline hover:no-underline"
                  >
                    View all products
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

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

// A slug is either a curated collection (lib/seo/collections.ts) or a free
// brand/keyword like "honda". The server resolves which and renders the first
// view; this component only handles re-sorting.
export function CollectionClient({
  title,
  intro,
  collectionSlug,
  searchTerm,
  initialProducts,
  related,
}: {
  title: string;
  intro: string | null;
  collectionSlug: string | null;
  searchTerm: string;
  initialProducts?: PublicListProduct[];
  related: { slug: string; name: string }[];
}) {
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [interacted, setInteracted] = useState(false);
  const isBrandSearch = !collectionSlug;

  const { data: products = [], isLoading } = useProducts({
    collection: collectionSlug ?? "",
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
            {intro && (
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                {intro}
              </p>
            )}
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

              {related.length > 0 && (
                <nav
                  aria-label="Related collections"
                  className="mt-16 border-t border-gray-200 pt-10"
                >
                  <h2 className="font-display text-3xl text-black mb-5">
                    Keep browsing
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {related.map((r) => (
                      <Link
                        key={r.slug}
                        href={`/shop/${r.slug}`}
                        className="px-5 py-2.5 rounded-full text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                      >
                        {r.name}
                      </Link>
                    ))}
                    <Link
                      href="/shop"
                      className="px-5 py-2.5 rounded-full text-sm font-medium bg-black text-white hover:bg-black/90 transition-colors"
                    >
                      Shop all
                    </Link>
                  </div>
                </nav>
              )}

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

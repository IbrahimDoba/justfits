"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { useProducts } from "@/lib/hooks/useProducts";
import { useCategories } from "@/lib/hooks/useCategories";
import {
  SHOP_DEFAULT_SORT as DEFAULT_SORT,
  SHOP_PAGE_LIMIT as PAGE_LIMIT,
} from "@/lib/shop/defaults";
import type { PublicListProduct, ShopCategory } from "@/lib/shop/list";

// First grid row (2 cols on phones, up to 4 on desktop) loads eagerly.
const PRIORITY_CARDS = 4;

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

export function ShopClient({
  initialProducts,
  initialCategories,
}: {
  initialProducts?: PublicListProduct[];
  initialCategories?: ShopCategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  // The server-rendered grid paints immediately; only animate the grid in
  // after the shopper changes a filter or sort.
  const [interacted, setInteracted] = useState(false);

  const isDefaultView = selectedCategory === "all" && sortBy === DEFAULT_SORT;

  const { data: categories = [] } = useCategories(initialCategories);
  const { data: products = [], isLoading } = useProducts({
    category: selectedCategory,
    sort: sortBy,
    limit: PAGE_LIMIT,
    initialData: isDefaultView ? initialProducts : undefined,
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Filters & Products */}
      <section className="pt-20 pb-12">
        <div className="container mx-auto px-6">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            {/* Categories */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => {
                    setInteracted(true);
                    setSelectedCategory(category.slug);
                  }}
                  className={`
                    px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200
                    ${
                      selectedCategory === category.slug
                        ? "bg-black text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }
                  `}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
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
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-500 mb-6">
            {isLoading ? (
              "Loading…"
            ) : (
              <>
                Showing {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </>
            )}
          </p>

          {/* Loading State (only when there is nothing to show yet) */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <motion.div
                key={selectedCategory + sortBy}
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

              {/* Empty State */}
              {products.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">
                    No products found in this category.
                  </p>
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="mt-4 text-black underline hover:no-underline"
                  >
                    View all products
                  </button>
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

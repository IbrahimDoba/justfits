"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { products, categories, formatPrice } from "@/lib/data/products";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { SlidersHorizontal } from "lucide-react";

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "all") return true;
    return (
      product.category.toLowerCase().replace(/\s+/g, "-") === selectedCategory
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "featured":
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-5xl md:text-7xl text-black tracking-tight mb-6">
              THE COLLECTION
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Premium caps inspired by the most iconic cars in automotive
              history.
              <br className="hidden sm:block" />
              Each piece is a tribute to engineering excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
          >
            {/* Categories */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`
                    px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200
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
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-sm text-gray-500 mb-6"
          >
            Showing {sortedProducts.length}{" "}
            {sortedProducts.length === 1 ? "product" : "products"}
          </motion.p>

          {/* Product Grid */}
          <motion.div
            key={selectedCategory + sortBy}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {sortedProducts.map((product, index) => (
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
                  variant={product.variant}
                  inStock={product.inStock}
                  layout="grid"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {sortedProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-gray-500 text-lg">
                No products found in this category.
              </p>
              <button
                onClick={() => setSelectedCategory("all")}
                className="mt-4 text-black underline hover:no-underline"
              >
                View all products
              </button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

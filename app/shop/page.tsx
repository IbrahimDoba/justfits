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

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  category: string;
  categorySlug: string;
  inStock: boolean;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  // Use query hooks instead of manual state management
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: products = [], isLoading: productsLoading } = useProducts({
    category: selectedCategory,
    sort: sortBy,
    limit: 50,
  });

  const isLoading = productsLoading;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Filters & Products */}
      <section className="pt-20 pb-12">
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
                <option value="newest">Newest</option>
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
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                Showing {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </>
            )}
          </motion.p>

          {/* Loading State */}
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
                initial="hidden"
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
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Empty State */}
              {products.length === 0 && (
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
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

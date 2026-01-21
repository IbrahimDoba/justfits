"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { SlidersHorizontal, Loader2, ChevronRight, Home } from "lucide-react";
import Link from "next/link";

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
  description: string | null;
  productCount: number;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.category as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch category info
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();

        const foundCategory = categoriesData.categories.find(
          (cat: Category) => cat.slug === categorySlug,
        );

        if (!foundCategory || foundCategory.slug === "all") {
          setError("Collection not found");
          setIsLoading(false);
          return;
        }

        setCategory(foundCategory);

        // Fetch products for this category
        const productsResponse = await fetch(
          `/api/products?category=${categorySlug}&sort=${sortBy}&limit=50`,
        );
        const productsData = await productsResponse.json();

        if (productsResponse.ok) {
          setProducts(productsData.products || []);
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching collection data:", err);
        setError("Failed to load collection");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [categorySlug, sortBy]);

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-32">
          <div className="text-center">
            <h1 className="font-display text-4xl md:text-6xl text-black mb-4">
              Collection Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The collection you're looking for doesn't exist.
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

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
            {category && (
              <>
                <ChevronRight size={16} />
                <span className="text-black font-medium">{category.name}</span>
              </>
            )}
          </nav>
        </div>
      </section>

      {/* Collection Header */}
      <section className="pb-16 bg-white">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
            </div>
          ) : category ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-display text-5xl md:text-7xl text-black tracking-tight mb-6">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {category.description}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-4">
                {category.productCount}{" "}
                {category.productCount === 1 ? "product" : "products"}
              </p>
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {/* Sort Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-end gap-3 mb-12"
          >
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
          </motion.div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <motion.div
                key={sortBy}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
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
                    No products found in this collection.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-4 inline-block text-black underline hover:no-underline"
                  >
                    View all products
                  </Link>
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

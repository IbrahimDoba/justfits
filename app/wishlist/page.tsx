"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils/format";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ChevronRight,
  Package,
} from "lucide-react";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (product: (typeof items)[0]) => {
    addToCart(product, 1, product.sizes[0] || null);
    showToast(`${product.name} added to cart!`, "success");
  };

  const handleRemove = (productId: string, productName: string) => {
    removeItem(productId);
    showToast(`${productName} removed from wishlist`, "info");
  };

  const handleClearAll = () => {
    clearWishlist();
    showToast("Wishlist cleared", "info");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-4xl text-black mb-2">
                  MY WISHLIST
                </h1>
                <p className="text-gray-600">
                  {items.length} {items.length === 1 ? "item" : "items"} saved
                </p>
              </div>
              {items.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              )}
            </div>

            {/* Wishlist Items */}
            {items.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid gap-4"
              >
                {items.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={fadeInUp}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="w-32 h-32 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
                      >
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package size={32} className="text-gray-400" />
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">
                              {product.category}
                            </p>
                            <Link
                              href={`/products/${product.slug}`}
                              className="text-lg font-semibold text-black hover:underline"
                            >
                              {product.name}
                            </Link>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleRemove(product.id, product.name)
                            }
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Remove from wishlist"
                          >
                            <Heart size={20} fill="currentColor" />
                          </button>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-semibold text-black">
                              {formatPrice(product.price)}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-gray-400 line-through">
                                {formatPrice(product.compareAtPrice)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {product.inStock ? (
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                              >
                                <ShoppingBag size={16} />
                                Add to Cart
                              </button>
                            ) : (
                              <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-sm">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Sizes */}
                        {product.sizes.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-sm text-gray-500">
                              Sizes:
                            </span>
                            <div className="flex gap-1">
                              {product.sizes.map((size) => (
                                <span
                                  key={size}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  {size}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-gray-500 mb-6">
                  Save items you love by clicking the heart icon
                  <br />
                  on any product page.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Explore Products
                  <ChevronRight size={18} />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/types/product";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/animations/variants";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart();

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-display text-5xl md:text-7xl text-black tracking-tight mb-4">
              YOUR CART
            </h1>
            <p className="text-gray-600 text-lg">
              {totalItems === 0
                ? "Your cart is empty"
                : `${totalItems} ${
                    totalItems === 1 ? "item" : "items"
                  } in your cart`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <ShoppingBag size={80} className="mx-auto text-gray-200 mb-6" />
              <h2 className="text-2xl font-heading font-semibold text-black mb-3">
                Your cart is empty
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Looks like you haven&apos;t added any premium caps to your cart
                yet. Browse our collection to find your perfect fit.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Browse Collection
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading font-semibold text-lg text-black">
                    Cart Items
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={fadeInUp}
                      custom={index}
                      className="bg-white rounded-2xl p-6 shadow-sm"
                    >
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="relative w-28 h-28 md:w-36 md:h-36 rounded-xl overflow-hidden shrink-0 bg-gray-100"
                        >
                          {item.product.images && item.product.images[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ProductImagePlaceholder
                              variant={item.product.variant}
                            />
                          )}
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                              <Link
                                href={`/products/${item.product.slug}`}
                                className="font-heading font-semibold text-black hover:text-gray-700 transition-colors"
                              >
                                {item.product.name}
                              </Link>
                              {item.size && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Size: {item.size}
                                </p>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
                                {item.product.category}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-mono text-lg font-semibold text-black">
                                {formatPrice(
                                  item.product.price * item.quantity
                                )}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-gray-500">
                                  {formatPrice(item.product.price)} each
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center bg-gray-100 rounded-full">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.size,
                                    item.quantity - 1
                                  )
                                }
                                className="p-2.5 hover:bg-gray-200 rounded-full transition-colors text-black"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-4 font-medium text-black">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.size,
                                    item.quantity + 1
                                  )
                                }
                                className="p-2.5 hover:bg-gray-200 rounded-full transition-colors text-black"
                                aria-label="Increase quantity"
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <button
                              onClick={() =>
                                removeItem(item.product.id, item.size)
                              }
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 shadow-sm sticky top-28"
                >
                  <h2 className="font-heading font-semibold text-lg text-black mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-mono">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-mono">
                        {totalPrice >= 50000 ? "Free" : formatPrice(3500)}
                      </span>
                    </div>
                    <div className="border-t border-gray-100 pt-4 flex justify-between text-black font-semibold">
                      <span>Total</span>
                      <span className="font-mono text-lg">
                        {formatPrice(
                          totalPrice >= 50000 ? totalPrice : totalPrice + 3500
                        )}
                      </span>
                    </div>
                  </div>

                  {totalPrice < 50000 && (
                    <p className="text-xs text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
                      Add {formatPrice(50000 - totalPrice)} more for free
                      shipping
                    </p>
                  )}

                  <Link
                    href="/checkout"
                    className="block w-full text-center py-4 px-6 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                  >
                    Proceed to Checkout
                  </Link>

                  <Link
                    href="/shop"
                    className="block w-full text-center py-3 px-6 mt-3 text-gray-600 hover:text-black transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
